import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator, Modal } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useAuth } from "../_layout";
import { supabase } from "../../data/supabase";

type Contexto = {
  id: string;
  titulo: string;
  subtitulo: string | null;
  icone: string | null;
  cor: string | null;
  cor_clara: string | null;
  ordem: number | null;
};

export default function AdminContextosScreen() {
  const router = useRouter();
  const { auth } = useAuth();
  const [contextos, setContextos] = useState<Contexto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [icone, setIcone] = useState("");
  const [cor, setCor] = useState("");
  const [corClara, setCorClara] = useState("");
  const [ordem, setOrdem] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (auth.perfil !== "admin") { router.replace("/criancas"); return; }
    loadData();
  }, []);

  async function loadData() {
    const { data } = await supabase.from("contextos").select("*").order("ordem");
    setContextos(data || []);
    setLoading(false);
  }

  function openAdd() {
    setEditingId(null);
    setTitulo("");
    setSubtitulo("");
    setIcone("");
    setCor("");
    setCorClara("");
    setOrdem("");
    setModalVisible(true);
  }

  function openEdit(ctx: Contexto) {
    setEditingId(ctx.id);
    setTitulo(ctx.titulo);
    setSubtitulo(ctx.subtitulo || "");
    setIcone(ctx.icone || "");
    setCor(ctx.cor || "");
    setCorClara(ctx.cor_clara || "");
    setOrdem(ctx.ordem != null ? String(ctx.ordem) : "");
    setModalVisible(true);
  }

  async function handleSave() {
    if (!titulo.trim()) { Alert.alert("Atenção", "Informe o título."); return; }
    setSaving(true);

    const row: any = { titulo: titulo.trim() };
    row.subtitulo = subtitulo.trim() || null;
    row.icone = icone.trim() || null;
    row.cor = cor.trim() || null;
    row.cor_clara = corClara.trim() || null;
    row.ordem = ordem.trim() ? Number(ordem.trim()) : null;

    if (editingId) {
      const { error } = await supabase.from("contextos").update(row).eq("id", editingId);
      if (error) { Alert.alert("Erro", error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("contextos").insert(row);
      if (error) { Alert.alert("Erro", error.message); setSaving(false); return; }
    }

    setSaving(false);
    setModalVisible(false);
    loadData();
  }

  function handleDelete(ctx: Contexto) {
    Alert.alert("Confirmar", `Excluir "${ctx.titulo}"? Isso removerá todas as categorias e indicadores vinculados.`, [
      { text: "Cancelar" },
      { text: "Excluir", style: "destructive", onPress: async () => {
        const { error } = await supabase.from("contextos").delete().eq("id", ctx.id);
        if (error) Alert.alert("Erro", error.message);
        else loadData();
      }},
    ]);
  }

  function handleTap(ctx: Contexto) {
    router.push(`/admin/categorias?contextoId=${ctx.id}&contextoNome=${encodeURIComponent(ctx.titulo)}`);
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1E3A5F" /></View>;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{contextos.length} contexto(s)</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <MaterialIcons name="add" size={20} color="#FFF" />
            <Text style={styles.addBtnText}>Adicionar</Text>
          </TouchableOpacity>
        </View>

        {contextos.map((ctx) => (
          <TouchableOpacity key={ctx.id} style={styles.card} onPress={() => handleTap(ctx)} activeOpacity={0.7}>
            <View style={[styles.iconCircle, { backgroundColor: ctx.cor || "#1E3A5F" }]}>
              <MaterialIcons name={(ctx.icone as any) || "category"} size={24} color="#FFF" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{ctx.titulo}</Text>
              {ctx.subtitulo ? <Text style={styles.cardSub}>{ctx.subtitulo}</Text> : null}
              {ctx.ordem != null ? <Text style={styles.cardDate}>Ordem: {ctx.ordem}</Text> : null}
            </View>
            <TouchableOpacity onPress={() => openEdit(ctx)} style={styles.iconBtn}>
              <MaterialIcons name="edit" size={20} color="#1E3A5F" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(ctx)} style={styles.iconBtn}>
              <MaterialIcons name="delete" size={20} color="#CC0000" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? "Editar Contexto" : "Novo Contexto"}</Text>
            <TextInput style={styles.input} placeholder="Título" value={titulo} onChangeText={setTitulo} autoCapitalize="sentences" />
            <TextInput style={styles.input} placeholder="Subtítulo" value={subtitulo} onChangeText={setSubtitulo} autoCapitalize="sentences" />
            <TextInput style={styles.input} placeholder="Ícone (nome MaterialIcons)" value={icone} onChangeText={setIcone} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Cor (hex, ex: #1E3A5F)" value={cor} onChangeText={setCor} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Cor clara (hex, ex: #E8F0FE)" value={corClara} onChangeText={setCorClara} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Ordem (número)" value={ordem} onChangeText={setOrdem} keyboardType="numeric" />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? "Salvando..." : "Salvar"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 16, fontWeight: "600", color: "#666" },
  addBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#1E3A5F", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 4 },
  addBtnText: { color: "#FFF", fontWeight: "600", fontSize: 14 },
  card: { backgroundColor: "#FFF", borderRadius: 12, padding: 16, marginBottom: 10, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", marginRight: 12 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: "600", color: "#1E3A5F" },
  cardSub: { fontSize: 13, color: "#666", marginTop: 2 },
  cardDate: { fontSize: 13, color: "#888", marginTop: 2 },
  iconBtn: { padding: 8, marginLeft: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 24 },
  modalContent: { backgroundColor: "#FFF", borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#1E3A5F", marginBottom: 20 },
  input: { backgroundColor: "#F5F7FA", borderRadius: 12, padding: 14, fontSize: 16, color: "#333", marginBottom: 12 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 8 },
  cancelBtn: { padding: 12, borderRadius: 8 },
  cancelBtnText: { color: "#666", fontWeight: "600" },
  saveBtn: { backgroundColor: "#1E3A5F", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  saveBtnText: { color: "#FFF", fontWeight: "600" },
});
