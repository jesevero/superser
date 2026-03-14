import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const APP_URL = Deno.env.get("APP_URL") ?? "https://superser-app.netlify.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function stripeRequest(endpoint: string, params: Record<string, string>) {
  const body = new URLSearchParams(params).toString();
  const res = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  return res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { avaliadorId, avaliadorEmail, avaliadorNome, priceId } = await req.json();

    if (!avaliadorId || !priceId) {
      return new Response(
        JSON.stringify({ error: "Dados incompletos." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create or reuse Stripe customer
    const customers = await fetch(
      `https://api.stripe.com/v1/customers/search?query=metadata['avaliador_id']:'${avaliadorId}'`,
      {
        headers: { "Authorization": `Bearer ${STRIPE_SECRET_KEY}` },
      }
    ).then((r) => r.json());

    let customerId: string;
    if (customers.data && customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const newCustomer = await stripeRequest("/customers", {
        email: avaliadorEmail || "",
        name: avaliadorNome || "",
        "metadata[avaliador_id]": avaliadorId,
      });
      customerId = newCustomer.id;
    }

    // Create Checkout Session
    const session = await stripeRequest("/checkout/sessions", {
      customer: customerId,
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      mode: "subscription",
      success_url: `${APP_URL}/assinatura?status=success`,
      cancel_url: `${APP_URL}/assinatura?status=cancel`,
      "metadata[avaliador_id]": avaliadorId,
    });

    if (session.error) {
      console.error("Stripe error:", session.error);
      return new Response(
        JSON.stringify({ error: session.error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Checkout error:", e);
    return new Response(
      JSON.stringify({ error: "Erro ao criar sessão de pagamento." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
