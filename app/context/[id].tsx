import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, ImageBackground } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { supabase } from "../../data/supabase";

type Categoria = { id: string; nome: string };
type Indicador = { id: string; nome: string; categoria_id: string };
type UltimaAvaliacao = { indicador_id: string; valor: number; data: string };

function RatingDots({ value }: { value: number }) {
  return (
    <View style={styles.dots}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={[styles.dot, {
          backgroundColor: i <= value
            ? (value >= 4 ? "#2E7D32" : value >= 3 ? "#C37800" : "#CC0000")
            : "#E0E0E0",
        }]} />
      ))}
    </View>
  );
}

export default function ContextScreen() {
  const { id, criancaId, criancaNome } = useLocalSearchParams<{
    id: string; criancaId: string; criancaNome: string;
  }>();
  const router = useRouter();

  const [contexto, setContexto] = useState<any>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [ultimas, setUltimas] = useState<Map<string, UltimaAvaliacao>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && criancaId) loadData();
  }, [id, criancaId]);

  async function loadData() {
    // Contexto
    const { data: ctx } = await supabase
      .from("contextos").select("*").eq("id", id).single();
    setContexto(ctx);

    // Categorias
    const { data: cats } = await supabase
      .from("categorias").select("*").eq("contexto_id", id).order("ordem");
    setCategorias(cats || []);

    // Indicadores
    const { data: inds } = await supabase
      .from("indicadores").select("*").eq("contexto_id", id).order("ordem");
    setIndicadores(inds || []);

    // Últimas avaliações
    const { data: ult } = await supabase
      .from("v_ultima_avaliacao")
      .select("indicador_id, valor, data")
      .eq("crianca_id", criancaId)
      .eq("contexto_id", id);

    const map = new Map<string, UltimaAvaliacao>();
    (ult || []).forEach((r: any) => map.set(r.indicador_id, r));
    setUltimas(map);

    setLoading(false);
  }

  if (loading || !contexto) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1E3A5F" /></View>;
  }

  return (
    <>
      <Stack.Screen options={{ title: contexto.titulo }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        {contexto.imagem_url ? (
          <ImageBackground source={{ uri: contexto.imagem_url }} style={[styles.header, { backgroundColor: contexto.cor }]} resizeMode="cover">
            <View style={[styles.headerOverlay, { backgroundColor: contexto.cor }]}>
              <MaterialIcons name={contexto.icone} size={36} color="#FFF" />
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>{contexto.titulo}</Text>
                <Text style={styles.headerSub}>{decodeURIComponent(criancaNome || "")} • {contexto.subtitulo}</Text>
              </View>
            </View>
          </ImageBackground>
        ) : (
          <View style={[styles.header, { backgroundColor: contexto.cor }]}>
            <MaterialIcons name={contexto.icone} size={36} color="#FFF" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>{contexto.titulo}</Text>
              <Text style={styles.headerSub}>{decodeURIComponent(criancaNome || "")} • {contexto.subtitulo}</Text>
            </View>
          </View>
        )}

        {/* Categories */}
        {categorias.map((cat, catIdx) => {
          const catIndicadores = indicadores.filter((ind) => ind.categoria_id === cat.id);
          return (
            <View key={cat.id} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={[styles.categoryTitle, { color: contexto.cor }]}>{cat.nome}</Text>
                <TouchableOpacity
                  style={[styles.evalButton, { backgroundColor: contexto.cor }]}
                  onPress={() => router.push(
                    `/avaliar/${id}/${catIdx}?criancaId=${criancaId}&criancaNome=${encodeURIComponent(criancaNome || "")}&categoriaId=${cat.id}`
                  )}
                >
                  <MaterialIcons name="edit" size={16} color="#FFF" />
                  <Text style={styles.evalButtonText}>Avaliar</Text>
                </TouchableOpacity>
              </View>

              {catIndicadores.map((ind, i) => {
                const rating = ultimas.get(ind.id);
                return (
                  <View key={ind.id} style={[styles.indicatorRow, i % 2 === 0 && styles.indicatorAlt]}>
                    <Text style={styles.indicatorName}>{ind.nome}</Text>
                    {rating ? (
                      <View style={styles.ratingInfo}>
                        <RatingDots value={rating.valor} />
                        <Text style={styles.ratingValue}>{rating.valor}/5</Text>
                      </View>
                    ) : (
                      <Text style={styles.notRated}>—</Text>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* History Button */}
        <TouchableOpacity
          style={[styles.historyBtn, { borderColor: contexto.cor }]}
          onPress={() => router.push(`/historico/${id}?criancaId=${criancaId}&criancaNome=${encodeURIComponent(criancaNome || "")}`)}
        >
          <MaterialIcons name="timeline" size={20} color={contexto.cor} />
          <Text style={[styles.historyBtnText, { color: contexto.cor }]}>Ver Histórico</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", padding: 24, gap: 16, overflow: "hidden" },
  headerOverlay: { flexDirection: "row", alignItems: "center", padding: 24, gap: 16, opacity: 0.85, flex: 1 },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#FFF" },
  headerSub: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  categorySection: { backgroundColor: "#FFF", margin: 16, marginBottom: 8, borderRadius: 12, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  categoryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  categoryTitle: { fontSize: 16, fontWeight: "700" },
  evalButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6 },
  evalButtonText: { color: "#FFF", fontWeight: "600", fontSize: 13 },
  indicatorRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  indicatorAlt: { backgroundColor: "#FAFBFC" },
  indicatorName: { fontSize: 14, color: "#333", flex: 1 },
  ratingInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  dots: { flexDirection: "row", gap: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  ratingValue: { fontSize: 13, color: "#666", fontWeight: "600", minWidth: 28 },
  notRated: { fontSize: 14, color: "#CCC" },
  historyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", margin: 16, padding: 16, borderRadius: 12, borderWidth: 2, gap: 8 },
  historyBtnText: { fontSize: 15, fontWeight: "600" },
});
