import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../../data/supabase";

type AvaliacaoHist = {
  indicador_id: string;
  indicador_nome: string;
  valor: number;
  data: string;
  created_at: string;
  avaliador_nome: string;
};

const COLORS_VAL = ["", "#CC0000", "#E65100", "#C37800", "#2E7D32", "#1B5E20"];
const LABELS = ["", "Muito Baixo", "Baixo", "Regular", "Bom", "Excelente"];

export default function HistoricoScreen() {
  const { contextId, criancaId, criancaNome } = useLocalSearchParams<{
    contextId: string; criancaId: string; criancaNome: string;
  }>();

  const [contexto, setContexto] = useState<any>(null);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoHist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contextId && criancaId) loadData();
  }, [contextId, criancaId]);

  async function loadData() {
    const { data: ctx } = await supabase.from("contextos").select("*").eq("id", contextId).single();
    setContexto(ctx);

    const { data } = await supabase
      .from("avaliacoes")
      .select("indicador_id, valor, data, created_at, indicadores(nome), avaliadores(nome)")
      .eq("crianca_id", criancaId)
      .eq("contexto_id", contextId)
      .order("created_at", { ascending: false });

    const mapped: AvaliacaoHist[] = (data || []).map((r: any) => ({
      indicador_id: r.indicador_id,
      indicador_nome: r.indicadores?.nome || r.indicador_id,
      valor: r.valor,
      data: r.data,
      created_at: r.created_at,
      avaliador_nome: r.avaliadores?.nome || "",
    }));
    setAvaliacoes(mapped);
    setLoading(false);
  }

  if (loading || !contexto) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1E3A5F" /></View>;
  }

  // Group by session (same created_at minute + same avaliador = same session)
  const sessions = new Map<string, AvaliacaoHist[]>();
  avaliacoes.forEach((a) => {
    // Round to the minute to group ratings saved together
    const minuteKey = a.created_at.slice(0, 16) + "|" + a.avaliador_nome;
    const list = sessions.get(minuteKey) || [];
    list.push(a);
    sessions.set(minuteKey, list);
  });
  const sessionKeys = Array.from(sessions.keys());

  function formatDateTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    }) + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <>
      <Stack.Screen options={{ title: `Histórico — ${contexto.titulo}` }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.childName}>{decodeURIComponent(criancaNome || "")}</Text>
        <Text style={styles.totalText}>{avaliacoes.length} avaliações em {sessionKeys.length} sessões</Text>

        {sessionKeys.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhuma avaliação registrada.</Text>
            <Text style={styles.emptyHint}>Volte ao contexto e toque em "Avaliar" para começar.</Text>
          </View>
        ) : (
          sessionKeys.map((key, idx) => {
            const ratings = sessions.get(key) || [];
            const avg = ratings.reduce((s, r) => s + r.valor, 0) / ratings.length;
            const avaliador = ratings[0]?.avaliador_nome;
            const timestamp = ratings[0]?.created_at;

            return (
              <View key={key} style={styles.dateCard}>
                <View style={styles.dateHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dateText}>{formatDateTime(timestamp)}</Text>
                    {avaliador && <Text style={styles.avaliadorText}>por {avaliador}</Text>}
                    <Text style={styles.countText}>{ratings.length} indicadores avaliados</Text>
                  </View>
                  <View style={[styles.avgBadge, {
                    backgroundColor: avg >= 4 ? "#2E7D32" : avg >= 3 ? "#C37800" : "#CC0000",
                  }]}>
                    <Text style={styles.avgText}>{avg.toFixed(1)}</Text>
                    <Text style={styles.avgLabel}>média</Text>
                  </View>
                </View>
                {ratings.map((r, i) => (
                  <View key={`${r.indicador_id}-${i}`} style={styles.ratingRow}>
                    <Text style={styles.ratingName}>{r.indicador_nome}</Text>
                    <View style={styles.ratingVal}>
                      <View style={[styles.ratingDot, { backgroundColor: COLORS_VAL[r.valor] }]} />
                      <Text style={[styles.ratingNum, { color: COLORS_VAL[r.valor] }]}>{r.valor}</Text>
                      <Text style={[styles.ratingLabel, { color: COLORS_VAL[r.valor] }]}>{LABELS[r.valor]}</Text>
                    </View>
                  </View>
                ))}
              </View>
            );
          })
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  childName: { fontSize: 18, fontWeight: "700", color: "#1E3A5F", marginBottom: 4 },
  totalText: { fontSize: 13, color: "#888", marginBottom: 16 },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 16, color: "#666", fontWeight: "600" },
  emptyHint: { fontSize: 13, color: "#999", marginTop: 8, textAlign: "center" },
  dateCard: { backgroundColor: "#FFF", borderRadius: 12, marginBottom: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  dateHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  dateText: { fontSize: 14, fontWeight: "600", color: "#1E3A5F" },
  avaliadorText: { fontSize: 12, color: "#999", marginTop: 2 },
  countText: { fontSize: 11, color: "#BBB", marginTop: 2 },
  avgBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, alignItems: "center", minWidth: 56 },
  avgText: { color: "#FFF", fontSize: 18, fontWeight: "800" },
  avgLabel: { color: "rgba(255,255,255,0.8)", fontSize: 10, fontWeight: "600" },
  ratingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#FAFAFA" },
  ratingName: { fontSize: 13, color: "#444", flex: 1 },
  ratingVal: { flexDirection: "row", alignItems: "center", gap: 6 },
  ratingDot: { width: 10, height: 10, borderRadius: 5 },
  ratingNum: { fontSize: 14, fontWeight: "700", minWidth: 16 },
  ratingLabel: { fontSize: 11, fontWeight: "600" },
});
