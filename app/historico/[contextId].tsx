import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useEffect, useState } from "react";
import Svg, { Text as SvgText, Line, G, Circle, Polyline, Defs, LinearGradient, Stop, Rect } from "react-native-svg";
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

type SessionSummary = {
  avg: number;
  date: string;
  created_at: string;
};

function LineChart({ sessions, color }: { sessions: SessionSummary[]; color: string }) {
  const last12 = sessions.slice(0, 12).reverse();
  if (last12.length === 0) return null;

  const chartW = Math.max(340, last12.length * 40 + 50);
  const chartH = 180;
  const padL = 28;
  const padR = 16;
  const padT = 20;
  const padB = 36;
  const areaW = chartW - padL - padR;
  const areaH = chartH - padT - padB;
  const maxVal = 5;
  const stepX = last12.length > 1 ? areaW / (last12.length - 1) : areaW;

  function pointColor(v: number): string {
    if (v >= 4) return "#2E7D32";
    if (v >= 3) return "#C37800";
    return "#CC0000";
  }

  function formatDate(iso: string): string {
    const d = new Date(iso + "T12:00:00");
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }

  const points = last12.map((s, i) => ({
    x: padL + i * stepX,
    y: padT + areaH - (s.avg / maxVal) * areaH,
    avg: s.avg,
    date: s.date,
  }));

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Area fill polygon (line + bottom)
  const areaPoints = [
    `${points[0].x},${padT + areaH}`,
    ...points.map((p) => `${p.x},${p.y}`),
    `${points[points.length - 1].x},${padT + areaH}`,
  ].join(" ");

  return (
    <View style={bStyles.card}>
      <Text style={bStyles.title}>Evolucao — Ultimas {last12.length} sessoes</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Svg width={chartW} height={chartH}>
          <Defs>
            <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity="0.2" />
              <Stop offset="1" stopColor={color} stopOpacity="0.02" />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          {[1, 2, 3, 4, 5].map((v) => {
            const y = padT + areaH - (v / maxVal) * areaH;
            return (
              <G key={`g-${v}`}>
                <Line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#F0F0F0" strokeWidth={0.8} />
                <SvgText x={padL - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#BBB">{String(v)}</SvgText>
              </G>
            );
          })}
          <Line x1={padL} y1={padT + areaH} x2={chartW - padR} y2={padT + areaH} stroke="#E0E0E0" strokeWidth={1} />

          {/* Area fill */}
          <Polyline points={areaPoints} fill="url(#areaGrad)" stroke="none" />

          {/* Line */}
          <Polyline points={polylinePoints} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

          {/* Points + labels */}
          {points.map((p, i) => (
            <G key={`p-${i}`}>
              <Circle cx={p.x} cy={p.y} r={5} fill={pointColor(p.avg)} stroke="#FFF" strokeWidth={2} />
              <SvgText x={p.x} y={p.y - 10} textAnchor="middle" fontSize={9} fontWeight="700" fill={pointColor(p.avg)}>
                {p.avg.toFixed(1)}
              </SvgText>
              <SvgText x={p.x} y={padT + areaH + 14} textAnchor="middle" fontSize={8} fill="#999">
                {formatDate(p.date)}
              </SvgText>
            </G>
          ))}
        </Svg>
      </ScrollView>
    </View>
  );
}

const bStyles = StyleSheet.create({
  card: { backgroundColor: "#FFF", borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  title: { fontSize: 15, fontWeight: "700", color: "#1E3A5F", marginBottom: 12 },
});

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
    const minuteKey = a.created_at.slice(0, 16) + "|" + a.avaliador_nome;
    const list = sessions.get(minuteKey) || [];
    list.push(a);
    sessions.set(minuteKey, list);
  });
  const sessionKeys = Array.from(sessions.keys());

  // Build session summaries for chart
  const sessionSummaries: SessionSummary[] = sessionKeys.map((key) => {
    const ratings = sessions.get(key) || [];
    const avg = ratings.reduce((s, r) => s + r.valor, 0) / ratings.length;
    return { avg, date: ratings[0].data, created_at: ratings[0].created_at };
  });

  function formatDateTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    }) + " as " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <>
      <Stack.Screen options={{ title: `Historico — ${contexto.titulo}` }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.childName}>{decodeURIComponent(criancaNome || "")}</Text>
        <Text style={styles.totalText}>{avaliacoes.length} avaliacoes em {sessionKeys.length} sessoes</Text>

        {/* Bar Chart */}
        {sessionSummaries.length > 0 && (
          <LineChart sessions={sessionSummaries} color={contexto.cor || "#1E3A5F"} />
        )}

        {sessionKeys.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhuma avaliacao registrada.</Text>
            <Text style={styles.emptyHint}>Volte ao contexto e toque em "Avaliar" para comecar.</Text>
          </View>
        ) : (
          sessionKeys.map((key) => {
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
                    <Text style={styles.avgLabel}>media</Text>
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
