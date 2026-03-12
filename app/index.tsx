import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useAuth } from "./_layout";
import { supabase } from "../data/supabase";
import Logo from "./Logo";
import RadarChart from "../components/RadarChart";

type Contexto = { id: string; titulo: string; subtitulo: string; icone: string; cor: string; cor_clara: string };
type Resumo = { contexto_id: string; media: number; indicadores_avaliados: number; ultima_avaliacao: string };

function ScoreBadge({ value }: { value: number | null }) {
  if (value === null) return <View style={[styles.badge, { backgroundColor: "#DDD" }]}><Text style={styles.badgeText}>—</Text></View>;
  const color = value >= 4 ? "#2E7D32" : value >= 3 ? "#C37800" : "#CC0000";
  return <View style={[styles.badge, { backgroundColor: color }]}><Text style={styles.badgeText}>{value.toFixed(1)}</Text></View>;
}

export default function HomeScreen() {
  const router = useRouter();
  const { auth, logout } = useAuth();
  const params = useLocalSearchParams<{ criancaId: string; criancaNome: string }>();

  const [contextos, setContextos] = useState<Contexto[]>([]);
  const [resumos, setResumos] = useState<Map<string, Resumo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [criancaNome, setCriancaNome] = useState("");
  const [criancaId, setCriancaId] = useState("");
  const [criancaFoto, setCriancaFoto] = useState<string | null>(null);

  useEffect(() => {
    if (params.criancaId) {
      setCriancaId(params.criancaId);
      setCriancaNome(decodeURIComponent(params.criancaNome || ""));
      loadData(params.criancaId);
    } else {
      router.replace("/criancas");
    }
  }, [params.criancaId]);

  async function loadData(childId: string) {
    // Load child photo
    const { data: childData } = await supabase.from("criancas").select("foto_url").eq("id", childId).maybeSingle();
    setCriancaFoto(childData?.foto_url || null);

    const { data: ctxData } = await supabase.from("contextos").select("*").order("ordem");
    setContextos(ctxData || []);
    const { data: resumoData } = await supabase.from("v_resumo_contexto").select("*").eq("crianca_id", childId);
    const map = new Map<string, Resumo>();
    (resumoData || []).forEach((r: any) => map.set(r.contexto_id, r));
    setResumos(map);
    setLoading(false);
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1E3A5F" /></View>;

  const totalIndicadores = resumos.size > 0 ? Array.from(resumos.values()).reduce((s, r) => s + r.indicadores_avaliados, 0) : 0;

  return (
    <>
      <Stack.Screen options={{
        title: "SuperSer",
        headerRight: () => (
          <TouchableOpacity onPress={logout} style={{ marginRight: 12 }}>
            <MaterialIcons name="logout" size={22} color="#1E3A5F" />
          </TouchableOpacity>
        ),
      }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              {criancaFoto ? (
                <Image source={{ uri: criancaFoto }} style={styles.childPhoto} />
              ) : (
                <Logo size={40} />
              )}
              <View style={styles.headerTitles}>
                <Text style={styles.headerTitle}>{criancaNome}</Text>
                <Text style={styles.headerSubtitle}>SuperSer 360°</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.switchChild} onPress={() => router.push("/criancas")}>
              <MaterialIcons name="swap-horiz" size={20} color="#AAC4E0" />
              <Text style={styles.switchText}>Trocar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.stat}><Text style={styles.statNumber}>{contextos.length}</Text><Text style={styles.statLabel}>Contextos</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.stat}><Text style={styles.statNumber}>{totalIndicadores}</Text><Text style={styles.statLabel}>Avaliados</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.stat}><Text style={styles.statNumber}>{auth.perfil}</Text><Text style={styles.statLabel}>Perfil</Text></View>
          </View>
        </View>

        {/* Radar Chart */}
        {contextos.length >= 3 && (
          <View style={styles.radarCard}>
            <Text style={styles.radarTitle}>Visão Geral</Text>
            <RadarChart
              data={contextos.map((ctx) => {
                const resumo = resumos.get(ctx.id);
                return {
                  label: ctx.titulo,
                  value: resumo ? resumo.media : 0,
                  color: ctx.cor,
                };
              })}
            />
          </View>
        )}

        <Text style={styles.sectionTitle}>Contextos</Text>
        {contextos.map((ctx) => {
          const resumo = resumos.get(ctx.id);
          return (
            <TouchableOpacity key={ctx.id} style={[styles.contextCard, { borderLeftColor: ctx.cor }]}
              onPress={() => router.push(`/context/${ctx.id}?criancaId=${criancaId}&criancaNome=${encodeURIComponent(criancaNome)}`)} activeOpacity={0.7}>
              <View style={[styles.iconCircle, { backgroundColor: ctx.cor_clara }]}>
                <MaterialIcons name={ctx.icone as any} size={28} color={ctx.cor} />
              </View>
              <View style={styles.contextInfo}>
                <Text style={styles.contextTitle}>{ctx.titulo}</Text>
                <Text style={styles.contextSubtitle}>{ctx.subtitulo}</Text>
                {resumo && <Text style={styles.contextMeta}>{resumo.indicadores_avaliados} avaliados • Última: {resumo.ultima_avaliacao}</Text>}
              </View>
              <View style={styles.contextRight}>
                <ScoreBadge value={resumo ? resumo.media : null} />
                <MaterialIcons name="chevron-right" size={24} color="#CCC" />
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={styles.footer}><Text style={styles.footerText}>SuperSer — MVP v2.0</Text></View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerCard: { backgroundColor: "#1E3A5F", borderRadius: 16, padding: 24, marginBottom: 24 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  childPhoto: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: "rgba(255,255,255,0.3)" },
  headerTitles: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#FFF" },
  headerSubtitle: { fontSize: 14, color: "#AAC4E0", marginTop: 2 },
  switchChild: { flexDirection: "row", alignItems: "center", gap: 4, padding: 8, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.1)" },
  switchText: { fontSize: 12, color: "#AAC4E0" },
  statsRow: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 16 },
  stat: { alignItems: "center" },
  statNumber: { fontSize: 20, fontWeight: "700", color: "#FFF" },
  statLabel: { fontSize: 11, color: "#AAC4E0", marginTop: 2 },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.2)" },
  radarCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 20, marginBottom: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, alignItems: "center" },
  radarTitle: { fontSize: 18, fontWeight: "700", color: "#1E3A5F", marginBottom: 12, alignSelf: "flex-start" },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1E3A5F", marginBottom: 12 },
  contextCard: { backgroundColor: "#FFF", borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: "row", alignItems: "center", borderLeftWidth: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  iconCircle: { width: 52, height: 52, borderRadius: 26, justifyContent: "center", alignItems: "center", marginRight: 14 },
  contextInfo: { flex: 1 },
  contextTitle: { fontSize: 17, fontWeight: "700", color: "#1E3A5F" },
  contextSubtitle: { fontSize: 13, color: "#666", marginTop: 2 },
  contextMeta: { fontSize: 11, color: "#999", marginTop: 4 },
  contextRight: { alignItems: "center", gap: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, minWidth: 42, alignItems: "center" },
  badgeText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  footer: { alignItems: "center", marginTop: 20, paddingVertical: 16 },
  footerText: { fontSize: 12, color: "#BBB" },
});
