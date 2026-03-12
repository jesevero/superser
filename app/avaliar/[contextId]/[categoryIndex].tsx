import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../_layout";
import { supabase } from "../../../data/supabase";

const LABELS = ["", "Muito Baixo", "Baixo", "Regular", "Bom", "Excelente"];
const COLORS_VAL = ["", "#CC0000", "#E65100", "#C37800", "#2E7D32", "#1B5E20"];

type Indicador = { id: string; nome: string };

function RatingSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.selectorRow}>
      {[1, 2, 3, 4, 5].map((v) => (
        <TouchableOpacity
          key={v}
          onPress={() => onChange(v)}
          style={[styles.selectorBtn, value === v && { backgroundColor: COLORS_VAL[v], borderColor: COLORS_VAL[v] }]}
        >
          <Text style={[styles.selectorNum, value === v && { color: "#FFF", fontWeight: "800" }]}>{v}</Text>
        </TouchableOpacity>
      ))}
      <Text style={[styles.selectorLabel, { color: value > 0 ? COLORS_VAL[value] : "#999" }]}>
        {value > 0 ? LABELS[value] : "Toque para avaliar"}
      </Text>
    </View>
  );
}

export default function AvaliarScreen() {
  const { contextId, categoryIndex, criancaId, criancaNome, categoriaId } = useLocalSearchParams<{
    contextId: string; categoryIndex: string; criancaId: string; criancaNome: string; categoriaId: string;
  }>();
  const router = useRouter();
  const { auth } = useAuth();

  const [contexto, setContexto] = useState<any>(null);
  const [categoria, setCategoria] = useState<any>(null);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: ctx } = await supabase.from("contextos").select("*").eq("id", contextId).single();
    setContexto(ctx);

    const { data: cat } = await supabase.from("categorias").select("*").eq("id", categoriaId).single();
    setCategoria(cat);

    const { data: inds } = await supabase.from("indicadores").select("*").eq("categoria_id", categoriaId).order("ordem");
    setIndicadores(inds || []);

    setLoading(false);
  }

  const updateRating = (id: string, value: number) => {
    setRatings((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    const filled = Object.entries(ratings).filter(([, v]) => v > 0);
    if (filled.length === 0) {
      setMessage({ text: "Avalie pelo menos um indicador antes de salvar.", error: true });
      return;
    }

    setSaving(true);
    setMessage(null);
    const today = new Date().toISOString().split("T")[0];

    const rows = filled.map(([indicadorId, valor]) => ({
      crianca_id: criancaId,
      avaliador_id: auth.avaliadorId,
      indicador_id: indicadorId,
      contexto_id: contextId,
      valor,
      data: today,
      observacoes: "",
    }));

    const { error } = await supabase.from("avaliacoes").insert(rows);

    setSaving(false);

    if (error) {
      setMessage({ text: `Erro: ${error.message}`, error: true });
    } else {
      setMessage({ text: `${filled.length} avaliações salvas com sucesso!`, error: false });
      setTimeout(() => router.back(), 1500);
    }
  };

  if (loading || !contexto || !categoria) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1E3A5F" /></View>;
  }

  const filledCount = Object.values(ratings).filter((v) => v > 0).length;
  const total = indicadores.length;
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <Stack.Screen options={{ title: `Avaliar — ${categoria.nome}` }} />
      <View style={styles.container}>
        {/* Progress */}
        <View style={[styles.progressBar, { backgroundColor: contexto.cor_clara }]}>
          <View style={[styles.progressFill, { backgroundColor: contexto.cor, width: `${(filledCount / total) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {filledCount} de {total} avaliados • {decodeURIComponent(criancaNome || "")} • {today}
        </Text>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {indicadores.map((ind, i) => (
            <View key={ind.id} style={[styles.card, i % 2 === 0 && styles.cardAlt]}>
              <Text style={styles.indicatorName}>{ind.nome}</Text>
              <RatingSelector value={ratings[ind.id] || 0} onChange={(v) => updateRating(ind.id, v)} />
            </View>
          ))}
        </ScrollView>

        <View style={styles.bottomBar}>
          {message && (
            <View style={[styles.messageBar, message.error ? styles.messageError : styles.messageSuccess]}>
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: contexto.cor, opacity: saving ? 0.6 : 1 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>
              {saving ? "Salvando..." : `Salvar ${filledCount} Avaliações`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  progressBar: { height: 4, borderRadius: 2, marginHorizontal: 16, marginTop: 12 },
  progressFill: { height: 4, borderRadius: 2 },
  progressText: { fontSize: 12, color: "#888", textAlign: "center", marginVertical: 8 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: "#FFF", borderRadius: 12, padding: 16, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardAlt: { backgroundColor: "#FAFBFC" },
  indicatorName: { fontSize: 15, fontWeight: "600", color: "#1E3A5F", marginBottom: 10 },
  selectorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  selectorBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "#DDD", justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  selectorNum: { fontSize: 16, fontWeight: "600", color: "#999" },
  selectorLabel: { fontSize: 12, marginLeft: 4, flex: 1 },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 32, backgroundColor: "#FFF", borderTopWidth: 1, borderTopColor: "#EEE" },
  saveBtn: { padding: 16, borderRadius: 12, alignItems: "center" },
  saveBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  messageBar: { padding: 12, borderRadius: 8, marginBottom: 10 },
  messageError: { backgroundColor: "#FFEBEE" },
  messageSuccess: { backgroundColor: "#E8F5E9" },
  messageText: { fontSize: 14, fontWeight: "600", textAlign: "center", color: "#333" },
});
