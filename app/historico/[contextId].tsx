import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../../data/supabase";

type AvaliacaoHist = {
  indicador_id: string;
  indicador_nome: string;
  valor: number;
  data: string;
  avaliador_nome: string;
};

const COLORS_VAL = ["", "#CC0000", "#E65100", "#C37800", "#2E7D32", "#1B5E20"];

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
      .select("indicador_id, valor, data, indicadores(nome), avaliadores(nome)")
      .eq("crianca_id", criancaId)
      .eq("contexto_id", contextId)
      .order("data", { ascending: false });

    const mapped: AvaliacaoHist[] = (data || []).map((r: any) => ({
      indicador_id: r.indicador_id,
      indicador_nome: r.indicadores?.nome || r.indicador_id,
      valor: r.valor,
      data: r.data,
      avaliador_nome: r.avaliadores?.nome || "",
    }));
    setAvaliacoes(mapped);
    setLoading(false);
  }

  if (loading || !contexto) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1E3A5F" /></View>;
  }

  // Group by date
  const byDate = new Map<string, AvaliacaoHist[]>();
  avaliacoes.forEach((a) => {
    const list = byDate.get(a.data) || [];
    list.push(a);
    byDate.set(a.data, list);
  });
  const dates = Array.from(byDate.keys()).sort().reverse();

  return (
    <>
      <Stack.Screen options={{
        title: `Histórico — ${contexto.titulo}`,
        headerStyle: { backgroundColor: contexto.cor },
      }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.childName}>{decodeURIComponent(criancaNome || "")}</Text>

        {dates.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhuma avaliação registrada.</Text>
            <Text style={styles.emptyHint}>Volte ao contexto e toque em "Avaliar" para começar.</Text>
          </View>
        ) : (
          dates.map((date) => {
            const dayRatings = byDate.get(date) || [];
            const avg = dayRatings.reduce((s, r) => s + r.valor, 0) / dayRatings.length;
            const avaliador = dayRatings[0]?.avaliador_nome;

            return (
              <View key={date} style={styles.dateCard}>
                <View style={styles.dateHeader}>
                  <View>
                    <Text style={styles.dateText}>
                      {new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
                        weekday: "long", day: "numeric", month: "long",
                      })}
                    </Text>
                    {avaliador && <Text style={styles.avaliadorText}>por {avaliador}</Text>}
                  </View>
                  <View style={[styles.avgBadge, {
                    backgroundColor: avg >= 4 ? "#2E7D32" : avg >= 3 ? "#C37800" : "#CC0000",
                  }]}>
                    <Text style={styles.avgText}>Média: {avg.toFixed(1)}</Text>
                  </View>
                </View>
                {dayRatings.map((r, i) => (
                  <View key={`${r.indicador_id}-${i}`} style={styles.ratingRow}>
                    <Text style={styles.ratingName}>{r.indicador_nome}</Text>
                    <View style={styles.ratingVal}>
                      <View style={[styles.ratingDot, { backgroundColor: COLORS_VAL[r.valor] }]} />
                      <Text style={[styles.ratingNum, { color: COLORS_VAL[r.valor] }]}>{r.valor}/5</Text>
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
  childName: { fontSize: 16, fontWeight: "600", color: "#1E3A5F", marginBottom: 16 },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 16, color: "#666", fontWeight: "600" },
  emptyHint: { fontSize: 13, color: "#999", marginTop: 8, textAlign: "center" },
  dateCard: { backgroundColor: "#FFF", borderRadius: 12, marginBottom: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  dateHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  dateText: { fontSize: 14, fontWeight: "600", color: "#1E3A5F" },
  avaliadorText: { fontSize: 11, color: "#999", marginTop: 2 },
  avgBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  avgText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
  ratingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#FAFAFA" },
  ratingName: { fontSize: 13, color: "#444", flex: 1 },
  ratingVal: { flexDirection: "row", alignItems: "center", gap: 6 },
  ratingDot: { width: 10, height: 10, borderRadius: 5 },
  ratingNum: { fontSize: 13, fontWeight: "600", minWidth: 28 },
});
