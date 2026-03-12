import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useAuth } from "../_layout";
import { supabase } from "../../data/supabase";

type Avaliador = { id: string; nome: string; email: string };
type Crianca = { id: string; nome: string };
type Vinculo = { id: string; avaliador_id: string; crianca_id: string };

export default function AdminVinculosScreen() {
  const router = useRouter();
  const { auth } = useAuth();
  const [avaliadores, setAvaliadores] = useState<Avaliador[]>([]);
  const [criancas, setCriancas] = useState<Crianca[]>([]);
  const [vinculos, setVinculos] = useState<Vinculo[]>([]);
  const [selectedAv, setSelectedAv] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (auth.perfil !== "admin") { router.replace("/criancas"); return; }
    loadData();
  }, []);

  async function loadData() {
    const [avRes, crRes, viRes] = await Promise.all([
      supabase.from("avaliadores").select("id, nome, email").order("nome"),
      supabase.from("criancas").select("id, nome").order("nome"),
      supabase.from("vinculos").select("*"),
    ]);
    setAvaliadores(avRes.data || []);
    setCriancas(crRes.data || []);
    setVinculos(viRes.data || []);
    if (avRes.data && avRes.data.length > 0 && !selectedAv) {
      setSelectedAv(avRes.data[0].id);
    }
    setLoading(false);
  }

  function isLinked(criancaId: string): boolean {
    return vinculos.some((v) => v.avaliador_id === selectedAv && v.crianca_id === criancaId);
  }

  async function toggleVinculo(criancaId: string) {
    if (!selectedAv || toggling) return;
    setToggling(true);

    const existing = vinculos.find((v) => v.avaliador_id === selectedAv && v.crianca_id === criancaId);

    if (existing) {
      const { error } = await supabase.from("vinculos").delete().eq("id", existing.id);
      if (error) { Alert.alert("Erro", error.message); setToggling(false); return; }
      setVinculos((prev) => prev.filter((v) => v.id !== existing.id));
    } else {
      const { data, error } = await supabase.from("vinculos").insert({ avaliador_id: selectedAv, crianca_id: criancaId }).select().single();
      if (error) { Alert.alert("Erro", error.message); setToggling(false); return; }
      if (data) setVinculos((prev) => [...prev, data]);
    }
    setToggling(false);
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1E3A5F" /></View>;

  const selectedAvName = avaliadores.find((a) => a.id === selectedAv)?.nome || "";
  const linkedCount = vinculos.filter((v) => v.avaliador_id === selectedAv).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Selecione um avaliador:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} contentContainerStyle={styles.chipsContent}>
        {avaliadores.map((av) => (
          <TouchableOpacity
            key={av.id}
            style={[styles.chip, selectedAv === av.id && styles.chipActive]}
            onPress={() => setSelectedAv(av.id)}
          >
            <Text style={[styles.chipText, selectedAv === av.id && styles.chipTextActive]}>{av.nome}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>
        {selectedAvName} — {linkedCount} criança(s) vinculada(s)
      </Text>

      {criancas.map((c) => {
        const linked = isLinked(c.id);
        return (
          <TouchableOpacity key={c.id} style={styles.card} onPress={() => toggleVinculo(c.id)} activeOpacity={0.7}>
            <View style={[styles.checkbox, linked && styles.checkboxActive]}>
              {linked && <MaterialIcons name="check" size={18} color="#FFF" />}
            </View>
            <Text style={styles.cardName}>{c.nome}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  label: { fontSize: 14, fontWeight: "600", color: "#666", marginBottom: 10 },
  chips: { marginBottom: 20 },
  chipsContent: { gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#DDD" },
  chipActive: { backgroundColor: "#1E3A5F", borderColor: "#1E3A5F" },
  chipText: { fontSize: 14, fontWeight: "600", color: "#666" },
  chipTextActive: { color: "#FFF" },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: "#1E3A5F", marginBottom: 12 },
  card: { backgroundColor: "#FFF", borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  checkbox: { width: 28, height: 28, borderRadius: 6, borderWidth: 2, borderColor: "#DDD", justifyContent: "center", alignItems: "center", marginRight: 14 },
  checkboxActive: { backgroundColor: "#2E7D32", borderColor: "#2E7D32" },
  cardName: { fontSize: 16, fontWeight: "600", color: "#333" },
});
