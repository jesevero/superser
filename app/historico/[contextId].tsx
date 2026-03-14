import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, Linking } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import Svg, { Text as SvgText, Line, G, Circle, Polyline, Defs, LinearGradient, Stop } from "react-native-svg";
import { supabase } from "../../data/supabase";
import { useAuth } from "../_layout";

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

  const areaPoints = [
    `${points[0].x},${padT + areaH}`,
    ...points.map((p) => `${p.x},${p.y}`),
    `${points[points.length - 1].x},${padT + areaH}`,
  ].join(" ");

  return (
    <View style={bStyles.card}>
      <Text style={bStyles.title}>Evolução — Últimas {last12.length} sessões</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Svg width={chartW} height={chartH}>
          <Defs>
            <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity="0.2" />
              <Stop offset="1" stopColor={color} stopOpacity="0.02" />
            </LinearGradient>
          </Defs>
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
          <Polyline points={areaPoints} fill="url(#areaGrad)" stroke="none" />
          <Polyline points={polylinePoints} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
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

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, "").replace(/###?\s?/g, "").replace(/^- /gm, "• ");
}

function AnaliseModal({ visible, onClose, analise, loading, whatsapp, email, criancaNome, contextoTitulo }: {
  visible: boolean;
  onClose: () => void;
  analise: string;
  loading: boolean;
  whatsapp: string | null;
  email: string | null;
  criancaNome: string;
  contextoTitulo: string;
}) {
  const [sent, setSent] = useState<string | null>(null);

  function renderText(text: string) {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <View key={i} style={{ height: 8 }} />;
      const isHeading = /^(\d+\.\s+\*\*|###?\s)/.test(trimmed);
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
      const elements = parts.map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <Text key={j} style={aStyles.bold}>{part.slice(2, -2)}</Text>;
        }
        return <Text key={j}>{part}</Text>;
      });
      return (
        <Text key={i} style={[aStyles.paragraph, isHeading && aStyles.heading]}>
          {elements}
        </Text>
      );
    });
  }

  function sendWhatsApp() {
    if (!whatsapp) return;
    const plain = stripMarkdown(analise);
    const header = `*SuperSer — Análise e Sugestões IA*\n_${criancaNome} • ${contextoTitulo}_\n\n`;
    const text = encodeURIComponent(header + plain);
    const number = whatsapp.replace(/\D/g, "");
    const url = `https://wa.me/55${number}?text=${text}`;
    Linking.openURL(url);
    setSent("whatsapp");
    setTimeout(() => setSent(null), 3000);
  }

  function sendEmail() {
    if (!email) return;
    const plain = stripMarkdown(analise);
    const subject = encodeURIComponent(`SuperSer — Análise: ${criancaNome} • ${contextoTitulo}`);
    const body = encodeURIComponent(plain);
    const url = `mailto:${email}?subject=${subject}&body=${body}`;
    Linking.openURL(url);
    setSent("email");
    setTimeout(() => setSent(null), 3000);
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={aStyles.overlay}>
        <View style={aStyles.container}>
          <View style={aStyles.header}>
            <View style={aStyles.headerLeft}>
              <MaterialIcons name="psychology" size={24} color="#1E3A5F" />
              <Text style={aStyles.headerTitle}>Análise e Sugestões IA</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={aStyles.closeBtn}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={aStyles.body} contentContainerStyle={aStyles.bodyContent}>
            {loading ? (
              <View style={aStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E3A5F" />
                <Text style={aStyles.loadingText}>Analisando dados...</Text>
                <Text style={aStyles.loadingHint}>Gerando parecer personalizado com base nas avaliações</Text>
              </View>
            ) : (
              <>
                {renderText(analise)}

                {/* Share buttons */}
                <View style={aStyles.shareSection}>
                  <Text style={aStyles.shareTitle}>Enviar para o responsável</Text>
                  <View style={aStyles.shareRow}>
                    <TouchableOpacity
                      style={[aStyles.shareBtn, aStyles.whatsappBtn, !whatsapp && aStyles.shareBtnDisabled]}
                      onPress={sendWhatsApp}
                      disabled={!whatsapp}
                    >
                      <MaterialIcons name="phone" size={20} color="#FFF" />
                      <Text style={aStyles.shareBtnText}>
                        {sent === "whatsapp" ? "Abrindo..." : whatsapp ? "Enviar por WhatsApp" : "WhatsApp não cadastrado"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[aStyles.shareBtn, aStyles.emailBtn, !email && aStyles.shareBtnDisabled]}
                      onPress={sendEmail}
                      disabled={!email}
                    >
                      <MaterialIcons name="email" size={20} color="#FFF" />
                      <Text style={aStyles.shareBtnText}>
                        {sent === "email" ? "Abrindo..." : email ? "Enviar por E-mail" : "E-mail não cadastrado"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
          {!loading && (
            <View style={aStyles.footer}>
              <MaterialIcons name="info-outline" size={14} color="#BBB" />
              <Text style={aStyles.footerText}>Análise gerada por IA. Consulte sempre um profissional.</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const aStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  container: { backgroundColor: "#FFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "85%", minHeight: "50%" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1E3A5F" },
  closeBtn: { padding: 4 },
  body: { flex: 1 },
  bodyContent: { padding: 20 },
  loadingContainer: { alignItems: "center", paddingVertical: 60 },
  loadingText: { fontSize: 16, fontWeight: "600", color: "#1E3A5F", marginTop: 16 },
  loadingHint: { fontSize: 13, color: "#999", marginTop: 8, textAlign: "center" },
  paragraph: { fontSize: 14, color: "#444", lineHeight: 22, marginBottom: 2 },
  heading: { fontSize: 15, fontWeight: "700", color: "#1E3A5F", marginTop: 12, marginBottom: 4 },
  bold: { fontWeight: "700", color: "#1E3A5F" },
  shareSection: { marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: "#F0F0F0" },
  shareTitle: { fontSize: 14, fontWeight: "700", color: "#1E3A5F", marginBottom: 12 },
  shareRow: { gap: 10 },
  shareBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 14, borderRadius: 12, gap: 10 },
  shareBtnDisabled: { opacity: 0.4 },
  whatsappBtn: { backgroundColor: "#25D366" },
  emailBtn: { backgroundColor: "#1E3A5F" },
  shareBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  footer: { flexDirection: "row", alignItems: "center", gap: 6, padding: 16, borderTopWidth: 1, borderTopColor: "#F0F0F0" },
  footerText: { fontSize: 11, color: "#BBB", flex: 1 },
});

export default function HistoricoScreen() {
  const { contextId, criancaId, criancaNome } = useLocalSearchParams<{
    contextId: string; criancaId: string; criancaNome: string;
  }>();
  const { auth } = useAuth();
  const router = useRouter();

  const [contexto, setContexto] = useState<any>(null);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoHist[]>([]);
  const [loading, setLoading] = useState(true);
  const [analiseVisible, setAnaliseVisible] = useState(false);
  const [analiseText, setAnaliseText] = useState("");
  const [analiseLoading, setAnaliseLoading] = useState(false);
  const [criancaWhatsapp, setCriancaWhatsapp] = useState<string | null>(null);
  const [criancaEmail, setCriancaEmail] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (contextId && criancaId) loadData();
  }, [contextId, criancaId]);

  async function loadData() {
    const { data: ctx } = await supabase.from("contextos").select("*").eq("id", contextId).single();
    setContexto(ctx);

    // Load child contact info
    const { data: childData } = await supabase.from("criancas").select("whatsapp, email_responsavel").eq("id", criancaId).maybeSingle();
    setCriancaWhatsapp(childData?.whatsapp || null);
    setCriancaEmail(childData?.email_responsavel || null);

    // Check subscription status
    if (auth.avaliadorId) {
      const { data: assinatura } = await supabase
        .from("assinaturas")
        .select("plano, status")
        .eq("avaliador_id", auth.avaliadorId)
        .maybeSingle();
      setIsPremium(assinatura?.plano === "premium" && assinatura?.status === "active");
    }

    // Check if user is admin (admins always have access)
    if (auth.perfil === "admin") {
      setIsPremium(true);
    }

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

  async function requestAnalise() {
    if (!isPremium) {
      router.push("/assinatura");
      return;
    }

    setAnaliseVisible(true);
    setAnaliseLoading(true);
    setAnaliseText("");

    try {
      const sessionsMap = new Map<string, AvaliacaoHist[]>();
      avaliacoes.forEach((a) => {
        const minuteKey = a.created_at.slice(0, 16) + "|" + a.avaliador_nome;
        const list = sessionsMap.get(minuteKey) || [];
        list.push(a);
        sessionsMap.set(minuteKey, list);
      });

      const sessionsPayload = Array.from(sessionsMap.entries()).map(([_, ratings]) => ({
        date: ratings[0].data,
        avaliador: ratings[0].avaliador_nome,
        avg: ratings.reduce((s, r) => s + r.valor, 0) / ratings.length,
        ratings: ratings.map((r) => ({
          indicador: r.indicador_nome,
          valor: r.valor,
        })),
      }));

      const { data, error } = await supabase.functions.invoke("analise", {
        body: {
          criancaNome: decodeURIComponent(criancaNome || ""),
          contextoTitulo: contexto.titulo,
          contextoPrompt: contexto.prompt || null,
          avaliacoes: sessionsPayload,
        },
      });

      if (error) {
        setAnaliseText("Erro ao gerar análise. Verifique se a função está configurada corretamente e tente novamente.");
      } else if (data?.error) {
        setAnaliseText(data.error);
      } else {
        setAnaliseText(data?.analise || "Não foi possível gerar a análise.");
      }
    } catch (e: any) {
      setAnaliseText("Erro de conexão. Verifique sua internet e tente novamente.");
    }
    setAnaliseLoading(false);
  }

  if (loading || !contexto) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1E3A5F" /></View>;
  }

  const sessions = new Map<string, AvaliacaoHist[]>();
  avaliacoes.forEach((a) => {
    const minuteKey = a.created_at.slice(0, 16) + "|" + a.avaliador_nome;
    const list = sessions.get(minuteKey) || [];
    list.push(a);
    sessions.set(minuteKey, list);
  });
  const sessionKeys = Array.from(sessions.keys());

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

  const decodedName = decodeURIComponent(criancaNome || "");

  return (
    <>
      <Stack.Screen options={{ title: `Histórico — ${contexto.titulo}` }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.childName}>{decodedName}</Text>
        <Text style={styles.totalText}>{avaliacoes.length} avaliações em {sessionKeys.length} sessões</Text>

        {sessionSummaries.length > 0 && (
          <LineChart sessions={sessionSummaries} color={contexto.cor || "#1E3A5F"} />
        )}

        {sessionKeys.length > 0 && (
          <TouchableOpacity style={[styles.analiseBtn, { borderColor: contexto.cor || "#1E3A5F" }]} onPress={requestAnalise}>
            <MaterialIcons name={isPremium ? "psychology" : "lock"} size={22} color={contexto.cor || "#1E3A5F"} />
            <Text style={[styles.analiseBtnText, { color: contexto.cor || "#1E3A5F" }]}>
              {isPremium ? "Análise e Sugestões IA" : "Análise IA (Premium)"}
            </Text>
          </TouchableOpacity>
        )}

        {sessionKeys.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhuma avaliação registrada.</Text>
            <Text style={styles.emptyHint}>Volte ao contexto e toque em "Avaliar" para começar.</Text>
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

      <AnaliseModal
        visible={analiseVisible}
        onClose={() => setAnaliseVisible(false)}
        analise={analiseText}
        loading={analiseLoading}
        whatsapp={criancaWhatsapp}
        email={criancaEmail}
        criancaNome={decodedName}
        contextoTitulo={contexto.titulo}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  childName: { fontSize: 18, fontWeight: "700", color: "#1E3A5F", marginBottom: 4 },
  totalText: { fontSize: 13, color: "#888", marginBottom: 16 },
  analiseBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 16, borderRadius: 12, borderWidth: 2, gap: 10, marginBottom: 16, backgroundColor: "#FFF", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  analiseBtnText: { fontSize: 16, fontWeight: "700" },
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
