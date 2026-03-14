import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

async function verifyStripeSignature(body: string, signature: string): Promise<boolean> {
  if (!STRIPE_WEBHOOK_SECRET) return true; // Skip verification if no secret configured

  const parts = signature.split(",").reduce((acc: Record<string, string>, part) => {
    const [key, value] = part.split("=");
    acc[key] = value;
    return acc;
  }, {});

  const timestamp = parts["t"];
  const expectedSig = parts["v1"];
  if (!timestamp || !expectedSig) return false;

  const payload = `${timestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(STRIPE_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computed === expectedSig;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    const valid = await verifyStripeSignature(body, signature);
    if (!valid) {
      return new Response("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(body);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const avaliadorId = session.metadata?.avaliador_id;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (avaliadorId) {
          let periodoInicio = new Date().toISOString();
          let periodoFim = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

          // Try to fetch subscription details from Stripe
          if (subscriptionId && STRIPE_SECRET_KEY) {
            try {
              const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
                headers: { "Authorization": `Bearer ${STRIPE_SECRET_KEY}` },
              });
              const sub = await subRes.json();
              console.log("Stripe subscription response:", JSON.stringify(sub));
              if (sub.current_period_start) {
                periodoInicio = new Date(sub.current_period_start * 1000).toISOString();
                periodoFim = new Date(sub.current_period_end * 1000).toISOString();
              }
            } catch (e) {
              console.error("Error fetching subscription:", e);
            }
          }

          // Check if record exists
          const { data: existing } = await supabase
            .from("assinaturas")
            .select("id")
            .eq("avaliador_id", avaliadorId)
            .maybeSingle();

          let dbResult;
          if (existing) {
            dbResult = await supabase.from("assinaturas").update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              plano: "premium",
              status: "active",
              periodo_inicio: periodoInicio,
              periodo_fim: periodoFim,
              updated_at: new Date().toISOString(),
            }).eq("avaliador_id", avaliadorId);
          } else {
            dbResult = await supabase.from("assinaturas").insert({
              avaliador_id: avaliadorId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              plano: "premium",
              status: "active",
              periodo_inicio: periodoInicio,
              periodo_fim: periodoFim,
              updated_at: new Date().toISOString(),
            });
          }
          console.log("DB result:", JSON.stringify(dbResult));
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId = sub.customer;

        const status = sub.status === "active" ? "active"
          : sub.status === "canceled" ? "canceled"
          : sub.status === "past_due" ? "past_due"
          : sub.status;

        const plano = sub.status === "canceled" ? "free" : "premium";

        await supabase.from("assinaturas")
          .update({
            status,
            plano,
            periodo_inicio: new Date(sub.current_period_start * 1000).toISOString(),
            periodo_fim: new Date(sub.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        await supabase.from("assinaturas")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
