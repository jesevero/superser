import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Modal, Image } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useAuth } from "../_layout";
import { supabase } from "../../data/supabase";
import ImageUpload from "../../components/ImageUpload";

type Crianca = { id: string; nome: string; data_nascimento: string | null; foto_url: string | null };

export default function AdminCriancasScreen() {
  const router = useRouter();
  const { auth } = useAuth();
  const [criancas, setCriancas] = useState<Crianca[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    if (auth.perfil !== "admin") { router.replace("/criancas"); return; }
    loadData();
  }, []);

  async function loadData() {
    const { data } = await supabase.from("criancas").select("*").order("nome");
    setCriancas(data || []);
    setLoading(false);
  }

  function openAdd() {
    setEditingId(null);
    setNome("");
    setDataNasc("");
    setFotoUrl(null);
    setMessage(null);
    setModalVisible(true);
  }

  function openEdit(c: Crianca) {
    setEditingId(c.id);
    setNome(c.nome);
    setDataNasc(c.data_nascimento || "");
    setFotoUrl(c.foto_url);
    setMessage(null);
    setModalVisible(true);
  }

  async function handleSave() {
    if (!nome.trim()) { setMessage({ text: "Informe o nome.", error: true }); return; }
    setSaving(true);
    setMessage(null);

    const row: any = { nome: nome.trim(), foto_url: fotoUrl || null };
    if (dataNasc.trim()) row.data_nascimento = dataNasc.trim();
    else row.data_nascimento = null;

    if (editingId) {
      const { error } = await supabase.from("criancas").update(row).eq("id", editingId);
      if (error) { setMessage({ text: `Erro: ${error.message}`, error: true }); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("criancas").insert(row);
      if (error) { setMessage({ text: `Erro: ${error.message}`, error: true }); setSaving(false); return; }
    }

    setSaving(false);
    setModalVisible(false);
    loadData();
  }

  async function handleDelete(c: Crianca) {
    const { error } = await supabase.from("criancas").delete().eq("id", c.id);
    if (error) setMessage({ text: `Erro: ${error.message}`, error: true });
    else loadData();
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1E3A5F" /></View>;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{criancas.length} crianca(s)</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <MaterialIcons name="add" size={20} color="#FFF" />
            <Text style={styles.addBtnText}>Adicionar</Text>
          </TouchableOpacity>
        </View>

        {criancas.map((c) => (
          <View key={c.id} style={styles.card}>
            {c.foto_url ? (
              <Image source={{ uri: c.foto_url }} style={styles.cardAvatar} />
            ) : (
              <View style={styles.cardAvatarPlaceholder}>
                <MaterialIcons name="child-care" size={24} color="#1E3A5F" />
              </View>
            )}
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{c.nome}</Text>
              {c.data_nascimento && <Text style={styles.cardDate}>{c.data_nascimento}</Text>}
            </View>
            <TouchableOpacity onPress={() => openEdit(c)} style={styles.iconBtn}>
              <MaterialIcons name="edit" size={20} color="#1E3A5F" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(c)} style={styles.iconBtn}>
              <MaterialIcons name="delete" size={20} color="#CC0000" />
            </TouchableOpacity>
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
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingId ? "Editar Crianca" : "Nova Crianca"}</Text>

              <View style={styles.photoRow}>
                <ImageUpload
                  currentUrl={fotoUrl}
                  bucket="images"
                  folder="criancas"
                  onUploaded={setFotoUrl}
                  size={100}
                  shape="circle"
                />
              </View>

              <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} autoCapitalize="words" />
              <TextInput style={styles.input} placeholder="Data de nascimento (AAAA-MM-DD)" value={dataNasc} onChangeText={setDataNasc} />

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
          </ScrollView>
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
  cardAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  cardAvatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#E8F0FE", justifyContent: "center", alignItems: "center", marginRight: 12 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: "600", color: "#1E3A5F" },
  cardDate: { fontSize: 13, color: "#888", marginTop: 2 },
  iconBtn: { padding: 8, marginLeft: 4 },
  photoRow: { alignItems: "center", marginBottom: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center" },
  modalScroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
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
