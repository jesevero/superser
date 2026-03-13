import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Modal } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useAuth } from "../_layout";
import { supabase } from "../../data/supabase";

type Indicador = {
  id: string;
  contexto_id: string;
  categoria_id: string;
  nome: string;
  ordem: number | null;
};

export default function AdminIndicadoresScreen() {
  const router = useRouter();
  const { auth } = useAuth();
  const { categoriaId, categoriaNome, contextoId } = useLocalSearchParams<{ categoriaId: string; categoriaNome: string; contextoId: string }>();
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [ordem, setOrdem] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (auth.perfil !== "admin") { router.replace("/criancas"); return; }
    loadData();
  }, []);

  async function loadData() {
    const { data } = await supabase.from("indicadores").select("*").eq("categoria_id", categoriaId).order("ordem");
    setIndicadores(data || []);
    setLoading(false);
  }

  function openAdd() {
    setEditingId(null);
    setNome("");
    setOrdem("");
    setMessage(null);
    setModalVisible(true);
  }

  function openEdit(ind: Indicador) {
    setEditingId(ind.id);
    setNome(ind.nome);
    setOrdem(ind.ordem != null ? String(ind.ordem) : "");
    setMessage(null);
    setModalVisible(true);
  }

  async function handleSave() {
    if (!nome.trim()) { setMessage({ text: "Informe o nome.", error: true }); return; }
    setSaving(true);
    setMessage(null);

    const row: any = { nome: nome.trim() };
    row.ordem = ordem.trim() ? Number(ordem.trim()) : null;

    if (editingId) {
      const { error } = await supabase.from("indicadores").update(row).eq("id", editingId);
      if (error) { setMessage({ text: `Erro: ${error.message}`, error: true }); setSaving(false); return; }
    } else {
      row.contexto_id = contextoId;
      row.categoria_id = categoriaId;
      const { error } = await supabase.from("indicadores").insert(row);
      if (error) { setMessage({ text: `Erro: ${error.message}`, error: true }); setSaving(false); return; }
    }

    setSaving(false);
    setModalVisible(false);
    loadData();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("indicadores").delete().eq("id", id);
    setConfirmDelete(null);
    if (error) setMessage({ text: `Erro: ${error.message}`, error: true });
    else loadData();
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1E3A5F" /></View>;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.contextLabel}>{categoriaNome}</Text>
        <View style={styles.header}>
          <Text style={styles.title}>{indicadores.length} indicador(es)</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <MaterialIcons name="add" size={20} color="#FFF" />
            <Text style={styles.addBtnText}>Adicionar</Text>
          </TouchableOpacity>
        </View>

        {indicadores.map((ind) => (
          <View key={ind.id} style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{ind.nome}</Text>
              {ind.ordem != null ? <Text style={styles.cardDate}>Ordem: {ind.ordem}</Text> : null}
            </View>
            <TouchableOpacity onPress={() => openEdit(ind)} style={styles.iconBtn}>
              <MaterialIcons name="edit" size={20} color="#1E3A5F" />
            </TouchableOpacity>
            {confirmDelete === ind.id ? (
              <View style={styles.confirmRow}>
                <TouchableOpacity onPress={() => handleDelete(ind.id)} style={styles.confirmYes}>
                  <MaterialIcons name="check" size={18} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setConfirmDelete(null)} style={styles.confirmNo}>
                  <MaterialIcons name="close" size={18} color="#666" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setConfirmDelete(ind.id)} style={styles.iconBtn}>
                <MaterialIcons name="delete" size={20} color="#CC0000" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {message && !modalVisible && (
          <View style={[styles.msgBar, message.error ? styles.msgError : styles.msgSuccess]}>
            <Text style={styles.msgText}>{message.text}</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? "Editar Indicador" : "Novo Indicador"}</Text>
            <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} autoCapitalize="sentences" />
            <TextInput style={styles.input} placeholder="Ordem (número)" value={ordem} onChangeText={setOrdem} keyboardType="numeric" />

            {message && (
              <View style={[styles.msgBar, message.error ? styles.msgError : styles.msgSuccess]}>
                <Text style={styles.msgText}>{message.text}</Text>
              </View>
            )}

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
  contextLabel: { fontSize: 13, fontWeight: "600", color: "#1E3A5F", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 16, fontWeight: "600", color: "#666" },
  addBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#1E3A5F", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 4 },
  addBtnText: { color: "#FFF", fontWeight: "600", fontSize: 14 },
  card: { backgroundColor: "#FFF", borderRadius: 12, padding: 16, marginBottom: 10, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: "600", color: "#1E3A5F" },
  cardDate: { fontSize: 13, color: "#888", marginTop: 2 },
  iconBtn: { padding: 8, marginLeft: 4 },
  confirmRow: { flexDirection: "row", gap: 6 },
  confirmYes: { backgroundColor: "#CC0000", borderRadius: 14, width: 28, height: 28, justifyContent: "center", alignItems: "center" },
  confirmNo: { backgroundColor: "#EEE", borderRadius: 14, width: 28, height: 28, justifyContent: "center", alignItems: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 24 },
  modalContent: { backgroundColor: "#FFF", borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#1E3A5F", marginBottom: 20 },
  input: { backgroundColor: "#F5F7FA", borderRadius: 12, padding: 14, fontSize: 16, color: "#333", marginBottom: 12 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 8 },
  cancelBtn: { padding: 12, borderRadius: 8 },
  cancelBtnText: { color: "#666", fontWeight: "600" },
  saveBtn: { backgroundColor: "#1E3A5F", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  saveBtnText: { color: "#FFF", fontWeight: "600" },
  msgBar: { padding: 12, borderRadius: 8, marginTop: 8 },
  msgError: { backgroundColor: "#FFEBEE" },
  msgSuccess: { backgroundColor: "#E8F5E9" },
  msgText: { fontSize: 14, fontWeight: "600", textAlign: "center", color: "#333" },
});
