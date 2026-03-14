import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useAuth } from "./_layout";
import { supabase } from "../data/supabase";

// Configure your Stripe Price ID here
const STRIPE_PRICE_ID = process.env.EXPO_PUBLIC_STRIPE_PRICE_ID || "";

type Assinatura = {
  id: string;
  plano: string;
  status: string;
  periodo_inicio: string | null;
  periodo_fim: string | null;
};

export default function AssinaturaScreen() {
  const { auth } = useAuth();
  const { status: urlStatus } = useLocalSearchParams<{ status?: string }>();
  const [assinatura, setAssinatura] = useState<Assinatura | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    loadAssinatura();
  }, []);

  useEffect(() => {
    if (urlStatus === "success") {
      setMessage({ text: "Pagamento realizado com sucesso! Sua assinatura será ativada em instantes.", error: false });
      // Reload after a short delay to catch webhook update
      setTimeout(loadAssinatura, 3000);
    } else if (urlStatus === "cancel") {
      setMessage({ text: "Pagamento cancelado.", error: true });
    }
  }, [urlStatus]);

  async function loadAssinatura() {
    const { data } = await supabase
      .from("assinaturas")
      .select("*")
      .eq("avaliador_id", auth.avaliadorId)
      .maybeSingle();
    setAssinatura(data);
    setLoading(false);
  }

  async function handleCheckout() {
    setCheckoutLoading(true);
    setMessage(null);

    try {
      console.log("Checkout payload:", { avaliadorId: auth.avaliadorId, email: auth.email, priceId: STRIPE_PRICE_ID });
      const { data, error } = await supabase.functions.invoke("stripe-checkout", {
        body: {
          avaliadorId: auth.avaliadorId,
          avaliadorEmail: auth.email || "",
          avaliadorNome: auth.nome || "",
          priceId: STRIPE_PRICE_ID,
        },
      });

      console.log("Checkout response:", { data, error });

      if (error) {
        const msg = error instanceof Error ? error.message : String(error);
        setMessage({ text: `Erro: ${msg}`, error: true });
      } else if (data?.error) {
        setMessage({ text: data.error, error: true });
      } else if (data?.url) {
        await Linking.openURL(data.url);
      } else {
        setMessage({ text: "Resposta inesperada do servidor.", error: true });
      }
    } catch (e: any) {
      console.error("Checkout exception:", e);
      setMessage({ text: `Erro: ${e?.message || "Conexão falhou."}`, error: true });
    }
    setCheckoutLoading(false);
  }

  function formatDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("pt-BR");
  }

  const isPremium = assinatura?.plano === "premium" && assinatura?.status === "active";

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1E3A5F" /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Minha Assinatura</Text>

      {/* Current status card */}
      <View style={styles.statusCard}>
        <View style={[styles.statusBadge, isPremium ? styles.badgePremium : styles.badgeFree]}>
          <MaterialIcons name={isPremium ? "star" : "star-border"} size={20} color="#FFF" />
          <Text style={styles.statusBadgeText}>{isPremium ? "Premium" : "Gratuito"}</Text>
        </View>
        {assinatura && isPremium && (
          <View style={styles.statusDetails}>
            <Text style={styles.statusDetail}>Status: {assinatura.status === "active" ? "Ativa" : assinatura.status}</Text>
            <Text style={styles.statusDetail}>Período: {formatDate(assinatura.periodo_inicio)} a {formatDate(assinatura.periodo_fim)}</Text>
          </View>
        )}
      </View>

      {/* Plans comparison */}
      <Text style={styles.sectionTitle}>Planos disponíveis</Text>

      {/* Free plan */}
      <View style={[styles.planCard, !isPremium && styles.planCardActive]}>
        <View style={styles.planHeader}>
          <Text style={styles.planName}>Gratuito</Text>
          <Text style={styles.planPrice}>R$ 0</Text>
        </View>
        <View style={styles.planFeatures}>
          <PlanFeature icon="check" text="Avaliações ilimitadas" />
          <PlanFeature icon="check" text="Histórico completo" />
          <PlanFeature icon="check" text="Gráficos de evolução" />
          <PlanFeature icon="close" text="Análise e Sugestões IA" disabled />
          <PlanFeature icon="close" text="Envio por WhatsApp e E-mail" disabled />
        </View>
        {!isPremium && (
          <View style={styles.currentPlanBadge}>
            <Text style={styles.currentPlanText}>Plano atual</Text>
          </View>
        )}
      </View>

      {/* Premium plan */}
      <View style={[styles.planCard, isPremium && styles.planCardActive, styles.planCardPremium]}>
        <View style={styles.planHeader}>
          <View>
            <Text style={[styles.planName, { color: "#1E3A5F" }]}>Premium</Text>
            <Text style={styles.planSubtitle}>Todos os recursos</Text>
          </View>
          <View style={styles.priceCol}>
            <Text style={[styles.planPrice, { color: "#1E3A5F" }]}>R$ 29,90</Text>
            <Text style={styles.planPeriod}>/mês</Text>
          </View>
        </View>
        <View style={styles.planFeatures}>
          <PlanFeature icon="check" text="Avaliações ilimitadas" />
          <PlanFeature icon="check" text="Histórico completo" />
          <PlanFeature icon="check" text="Gráficos de evolução" />
          <PlanFeature icon="check" text="Análise e Sugestões IA" highlight />
          <PlanFeature icon="check" text="Envio por WhatsApp e E-mail" highlight />
        </View>
        {isPremium ? (
          <View style={styles.currentPlanBadge}>
            <Text style={styles.currentPlanText}>Plano atual</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.checkoutBtn, checkoutLoading && { opacity: 0.6 }]}
            onPress={handleCheckout}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <MaterialIcons name="lock-open" size={20} color="#FFF" />
                <Text style={styles.checkoutBtnText}>Assinar Premium</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {message && (
        <View style={[styles.msgBar, message.error ? styles.msgError : styles.msgSuccess]}>
          <Text style={styles.msgText}>{message.text}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <MaterialIcons name="security" size={16} color="#BBB" />
        <Text style={styles.footerText}>Pagamento seguro processado pelo Stripe. Cancele a qualquer momento.</Text>
      </View>
    </ScrollView>
  );
}

function PlanFeature({ icon, text, disabled, highlight }: { icon: string; text: string; disabled?: boolean; highlight?: boolean }) {
  return (
    <View style={styles.featureRow}>
      <MaterialIcons
        name={icon as any}
        size={18}
        color={disabled ? "#CCC" : highlight ? "#1E3A5F" : "#2E7D32"}
      />
      <Text style={[styles.featureText, disabled && styles.featureDisabled, highlight && styles.featureHighlight]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  pageTitle: { fontSize: 22, fontWeight: "700", color: "#1E3A5F", marginBottom: 20 },
  statusCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 20, marginBottom: 24, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6 },
  badgePremium: { backgroundColor: "#1E3A5F" },
  badgeFree: { backgroundColor: "#888" },
  statusBadgeText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  statusDetails: { marginTop: 12, alignItems: "center" },
  statusDetail: { fontSize: 13, color: "#666", marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1E3A5F", marginBottom: 12 },
  planCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 2, borderColor: "#E0E0E0", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  planCardActive: { borderColor: "#1E3A5F" },
  planCardPremium: { borderColor: "#1E3A5F", backgroundColor: "#FAFCFF" },
  planHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  planName: { fontSize: 18, fontWeight: "700", color: "#333" },
  planSubtitle: { fontSize: 12, color: "#888", marginTop: 2 },
  planPrice: { fontSize: 24, fontWeight: "800", color: "#333" },
  priceCol: { alignItems: "flex-end" },
  planPeriod: { fontSize: 12, color: "#888" },
  planFeatures: { gap: 8 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { fontSize: 14, color: "#444" },
  featureDisabled: { color: "#CCC", textDecorationLine: "line-through" },
  featureHighlight: { fontWeight: "600", color: "#1E3A5F" },
  currentPlanBadge: { marginTop: 16, alignItems: "center", padding: 10, borderRadius: 8, backgroundColor: "#F0F4F8" },
  currentPlanText: { fontSize: 13, fontWeight: "600", color: "#1E3A5F" },
  checkoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 16, backgroundColor: "#1E3A5F", padding: 16, borderRadius: 12, gap: 8 },
  checkoutBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  msgBar: { padding: 12, borderRadius: 8, marginTop: 8 },
  msgError: { backgroundColor: "#FFEBEE" },
  msgSuccess: { backgroundColor: "#E8F5E9" },
  msgText: { fontSize: 14, fontWeight: "600", textAlign: "center", color: "#333" },
  footer: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#E0E0E0" },
  footerText: { fontSize: 12, color: "#BBB", flex: 1 },
});
