import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useAuth } from "./_layout";
import { supabase } from "../data/supabase";

type Crianca = { id: string; nome: string; data_nascimento: string | null };

export default function CriancasScreen() {
  const router = useRouter();
  const { auth, logout } = useAuth();
  const [criancas, setCriancas] = useState<Crianca[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCriancas(); }, [auth.avaliadorId, auth.perfil]);

  async function loadCriancas() {
    if (!auth.avaliadorId) { setLoading(false); return; }

    try {
      // Admin vê todas as crianças
      if (auth.perfil === "admin") {
        const { data } = await supabase.from("criancas").select("*").order("nome");
        setCriancas(data || []);
      } else {
        const { data: vinculos } = await supabase
          .from("vinculos")
          .select("crianca_id")
          .eq("avaliador_id", auth.avaliadorId);

        if (vinculos && vinculos.length > 0) {
          const ids = vinculos.map((v: any) => v.crianca_id);
          const { data } = await supabase.from("criancas").select("*").in("id", ids).order("nome");
          setCriancas(data || []);
        }
      }
    } catch (e) {
      console.log("Erro ao carregar crianças:", e);
    }
    setLoading(false);
  }

  function calcIdade(dataNasc: string | null): string {
    if (!dataNasc) return "";
    const nasc = new Date(dataNasc);
    const hoje = new Date();
    let anos = hoje.getFullYear() - nasc.getFullYear();
    if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) anos--;
    return `${anos} anos`;
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1E3A5F" /></View>;

  return (
    <>
    <Stack.Screen options={{
      title: "Selecionar Criança",
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {auth.perfil === "admin" && (
            <TouchableOpacity onPress={() => router.push("/admin" as any)} style={{ marginRight: 12 }}>
              <MaterialIcons name="settings" size={22} color="#1E3A5F" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={logout} style={{ marginRight: 12 }}>
            <MaterialIcons name="logout" size={22} color="#1E3A5F" />
          </TouchableOpacity>
        </View>
      ),
    }} />
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.hello}>Olá, {auth.nome}!</Text>
      <Text style={styles.instrucao}>Selecione uma criança para avaliar:</Text>

      {criancas.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="child-care" size={64} color="#DDD" />
          <Text style={styles.emptyText}>Nenhuma criança vinculada</Text>
          <Text style={styles.emptyHint}>Peça ao administrador para vincular você a uma criança no painel do Supabase.</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <MaterialIcons name="logout" size={18} color="#CC0000" />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      ) : (
        criancas.map((c) => (
          <TouchableOpacity key={c.id} style={styles.card}
            onPress={() => router.push(`/?criancaId=${c.id}&criancaNome=${encodeURIComponent(c.nome)}`)} activeOpacity={0.7}>
            <View style={styles.avatar}><MaterialIcons name="child-care" size={32} color="#1E3A5F" /></View>
            <View style={styles.info}>
              <Text style={styles.nome}>{c.nome}</Text>
              {c.data_nascimento && <Text style={styles.idade}>{calcIdade(c.data_nascimento)}</Text>}
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  hello: { fontSize: 22, fontWeight: "700", color: "#1E3A5F", marginBottom: 4 },
  instrucao: { fontSize: 14, color: "#666", marginBottom: 24 },
  card: { backgroundColor: "#FFF", borderRadius: 14, padding: 18, marginBottom: 12, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#E8F0FE", justifyContent: "center", alignItems: "center", marginRight: 16 },
  info: { flex: 1 },
  nome: { fontSize: 17, fontWeight: "700", color: "#1E3A5F" },
  idade: { fontSize: 13, color: "#888", marginTop: 2 },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 16, color: "#999", fontWeight: "600", marginTop: 16 },
  emptyHint: { fontSize: 13, color: "#BBB", marginTop: 8, textAlign: "center", paddingHorizontal: 40 },
  logoutBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 24, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#CC0000" },
  logoutText: { color: "#CC0000", fontWeight: "600" },
});
