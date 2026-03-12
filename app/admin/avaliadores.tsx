import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Modal } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useAuth } from "../_layout";
import { supabase } from "../../data/supabase";

type Avaliador = { id: string; nome: string; email: string; perfil: string; auth_id: string | null };

const emptyForm = { nome: "", email: "", perfil: "familia" };

export default function AdminAvaliadoresScreen() {
  const router = useRouter();
  const { auth } = useAuth();
  const [avaliadores, setAvaliadores] = useState<Avaliador[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (auth.perfil !== "admin") { router.replace("/criancas"); return; }
    loadData();
  }, []);

  async function loadData() {
    const { data } = await supabase.from("avaliadores").select("id, nome, email, perfil, auth_id").order("nome");
    setAvaliadores(data || []);
    setLoading(false);
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage(null);
    setModalVisible(true);
  }

  function openEdit(av: Avaliador) {
    setEditingId(av.id);
    setForm({ nome: av.nome, email: av.email, perfil: av.perfil });
    setMessage(null);
    setModalVisible(true);
  }

  async function handleSave() {
    if (!form.nome.trim() || !form.email.trim()) {
      setMessage({ text: "Preencha nome e email.", error: true });
      return;
    }
    setSaving(true);
    setMessage(null);

    if (editingId) {
      const { error } = await supabase.from("avaliadores").update({
        nome: form.nome.trim(),
        email: form.email.trim(),
        perfil: form.perfil,
      }).eq("id", editingId);

      setSaving(false);
      if (error) {
        setMessage({ text: `Erro: ${error.message}`, error: true });
      } else {
        setModalVisible(false);
        loadData();
      }
    } else {
      const { error } = await supabase.from("avaliadores").insert({
        nome: form.nome.trim(),
        email: form.email.trim(),
        perfil: form.perfil,
      });

      setSaving(false);
      if (error) {
        setMessage({ text: `Erro: ${error.message}`, error: true });
      } else {
        setModalVisible(false);
        loadData();
      }
    }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("avaliadores").delete().eq("id", id);
    setConfirmDelete(null);
    if (error) {
      setMessage({ text: `Erro ao excluir: ${error.message}`, error: true });
    } else {
      loadData();
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1E3A5F" /></View>;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>{avaliadores.length} avaliador(es)</Text>

        {avaliadores.map((av) => (
          <View key={av.id} style={styles.card}>
            <View style={styles.avatarCircle}>
              <MaterialIcons name={av.perfil === "admin" ? "admin-panel-settings" : "person"} size={24} color="#1E3A5F" />
            </View>
            <TouchableOpacity style={styles.cardInfo} onPress={() => openEdit(av)}>
              <Text style={styles.cardName}>{av.nome}</Text>
              <Text style={styles.cardEmail}>{av.email}</Text>
              {!av.auth_id && <Text style={styles.cardPending}>Sem conta vinculada</Text>}
            </TouchableOpacity>
            <View style={styles.cardActions}>
              <View style={[styles.perfilBadge, av.perfil === "admin" ? styles.adminBadge : styles.familiaBadge]}>
                <Text style={[styles.perfilText, av.perfil === "admin" ? styles.adminText : styles.familiaText]}>
                  {av.perfil}
                </Text>
              </View>
              {confirmDelete === av.id ? (
                <View style={styles.confirmRow}>
                  <TouchableOpacity onPress={() => handleDelete(av.id)} style={styles.confirmYes}>
                    <MaterialIcons name="check" size={18} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setConfirmDelete(null)} style={styles.confirmNo}>
                    <MaterialIcons name="close" size={18} color="#666" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setConfirmDelete(av.id)} style={styles.deleteBtn}>
                  <MaterialIcons name="delete-outline" size={20} color="#CC0000" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {message && !modalVisible && (
          <View style={[styles.messageBar, message.error ? styles.messageError : styles.messageSuccess]}>
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <MaterialIcons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? "Editar Avaliador" : "Novo Avaliador"}</Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} value={form.nome} onChangeText={(t) => setForm({ ...form, nome: t })} placeholder="Nome completo" autoCapitalize="words" />

            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} placeholder="email@exemplo.com" keyboardType="email-address" autoCapitalize="none" />

            <Text style={styles.label}>Perfil</Text>
            <View style={styles.perfilRow}>
              {["familia", "admin"].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.perfilOption, form.perfil === p && styles.perfilOptionActive]}
                  onPress={() => setForm({ ...form, perfil: p })}
                >
                  <Text style={[styles.perfilOptionText, form.perfil === p && styles.perfilOptionTextActive]}>
                    {p === "familia" ? "Família" : "Admin"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {message && (
              <View style={[styles.messageBar, message.error ? styles.messageError : styles.messageSuccess]}>
                <Text style={styles.messageText}>{message.text}</Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveText}>{saving ? "Salvando..." : "Salvar"}</Text>
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
  content: { padding: 20, paddingBottom: 100 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  subtitle: { fontSize: 16, fontWeight: "600", color: "#666", marginBottom: 16 },
  card: { backgroundColor: "#FFF", borderRadius: 12, padding: 16, marginBottom: 10, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#E8F0FE", justifyContent: "center", alignItems: "center", marginRight: 12 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: "600", color: "#1E3A5F" },
  cardEmail: { fontSize: 13, color: "#888", marginTop: 2 },
  cardPending: { fontSize: 11, color: "#C37800", marginTop: 2 },
  cardActions: { alignItems: "flex-end", gap: 8 },
  perfilBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  adminBadge: { backgroundColor: "#E8F5E9", borderColor: "#2E7D32" },
  familiaBadge: { backgroundColor: "#F5F7FA", borderColor: "#CCC" },
  perfilText: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  adminText: { color: "#2E7D32" },
  familiaText: { color: "#888" },
  deleteBtn: { padding: 4 },
  confirmRow: { flexDirection: "row", gap: 6 },
  confirmYes: { backgroundColor: "#CC0000", borderRadius: 14, width: 28, height: 28, justifyContent: "center", alignItems: "center" },
  confirmNo: { backgroundColor: "#EEE", borderRadius: 14, width: 28, height: 28, justifyContent: "center", alignItems: "center" },
  fab: { position: "absolute", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: "#1E3A5F", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 24 },
  modalContent: { backgroundColor: "#FFF", borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#1E3A5F", marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "600", color: "#666", marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: "#F5F7FA", borderRadius: 10, padding: 14, fontSize: 16, color: "#333" },
  perfilRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  perfilOption: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1.5, borderColor: "#DDD", alignItems: "center" },
  perfilOptionActive: { borderColor: "#1E3A5F", backgroundColor: "#E8F0FE" },
  perfilOptionText: { fontSize: 14, fontWeight: "600", color: "#888" },
  perfilOptionTextActive: { color: "#1E3A5F" },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#DDD", alignItems: "center" },
  cancelText: { fontSize: 15, fontWeight: "600", color: "#666" },
  saveBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: "#1E3A5F", alignItems: "center" },
  saveText: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  messageBar: { padding: 12, borderRadius: 8, marginTop: 12 },
  messageError: { backgroundColor: "#FFEBEE" },
  messageSuccess: { backgroundColor: "#E8F5E9" },
  messageText: { fontSize: 14, fontWeight: "600", textAlign: "center", color: "#333" },
});
