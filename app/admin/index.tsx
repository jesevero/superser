import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useAuth } from "../_layout";
import { supabase } from "../../data/supabase";

type Counts = { criancas: number; avaliadores: number; vinculos: number; contextos: number };

export default function AdminScreen() {
  const router = useRouter();
  const { auth } = useAuth();
  const [counts, setCounts] = useState<Counts>({ criancas: 0, avaliadores: 0, vinculos: 0, contextos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.perfil !== "admin") {
      router.replace("/criancas");
      return;
    }
    loadCounts();
  }, []);

  async function loadCounts() {
    const [c1, c2, c3, c4] = await Promise.all([
      supabase.from("criancas").select("id", { count: "exact", head: true }),
      supabase.from("avaliadores").select("id", { count: "exact", head: true }),
      supabase.from("vinculos").select("id", { count: "exact", head: true }),
      supabase.from("contextos").select("id", { count: "exact", head: true }),
    ]);
    setCounts({
      criancas: c1.count ?? 0,
      avaliadores: c2.count ?? 0,
      vinculos: c3.count ?? 0,
      contextos: c4.count ?? 0,
    });
    setLoading(false);
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1E3A5F" /></View>;

  const cards = [
    { title: "Crianças", subtitle: `${counts.criancas} cadastradas`, icon: "child-care" as const, route: "/admin/criancas" },
    { title: "Avaliadores", subtitle: `${counts.avaliadores} cadastrados`, icon: "people" as const, route: "/admin/avaliadores" },
    { title: "Vínculos", subtitle: `${counts.vinculos} ativos`, icon: "link" as const, route: "/admin/vinculos" },
    { title: "Contextos", subtitle: `${counts.contextos} contextos`, icon: "category" as const, route: "/admin/contextos" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.hello}>Painel Administrativo</Text>
      <Text style={styles.subtitle}>Gerencie crianças, avaliadores, vínculos e contextos.</Text>

      {cards.map((card) => (
        <TouchableOpacity key={card.route} style={styles.card} onPress={() => router.push(card.route as any)} activeOpacity={0.7}>
          <View style={styles.iconCircle}>
            <MaterialIcons name={card.icon} size={32} color="#1E3A5F" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#CCC" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  hello: { fontSize: 22, fontWeight: "700", color: "#1E3A5F", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 24 },
  card: { backgroundColor: "#FFF", borderRadius: 14, padding: 18, marginBottom: 12, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  iconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#E8F0FE", justifyContent: "center", alignItems: "center", marginRight: 16 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#1E3A5F" },
  cardSubtitle: { fontSize: 13, color: "#888", marginTop: 2 },
});
