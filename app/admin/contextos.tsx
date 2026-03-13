import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Modal, Image } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useAuth } from "../_layout";
import { supabase } from "../../data/supabase";
import ImageUpload from "../../components/ImageUpload";

type Contexto = {
  id: string;
  titulo: string;
  subtitulo: string | null;
  icone: string | null;
  cor: string | null;
  cor_clara: string | null;
  ordem: number | null;
  imagem_url: string | null;
  prompt: string | null;
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
  const [imagemUrl, setImagemUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

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
    setImagemUrl(null);
    setPrompt("");
    setMessage(null);
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
    setImagemUrl(ctx.imagem_url);
    setPrompt(ctx.prompt || "");
    setMessage(null);
    setModalVisible(true);
  }

  async function handleSave() {
    if (!titulo.trim()) { setMessage({ text: "Informe o titulo.", error: true }); return; }
    setSaving(true);
    setMessage(null);

    const row: any = { titulo: titulo.trim(), imagem_url: imagemUrl || null };
    row.subtitulo = subtitulo.trim() || null;
    row.icone = icone.trim() || null;
    row.cor = cor.trim() || null;
    row.cor_clara = corClara.trim() || null;
    row.ordem = ordem.trim() ? Number(ordem.trim()) : null;
    row.prompt = prompt.trim() || null;

    if (editingId) {
      const { error } = await supabase.from("contextos").update(row).eq("id", editingId);
      if (error) { setMessage({ text: `Erro: ${error.message}`, error: true }); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("contextos").insert(row);
      if (error) { setMessage({ text: `Erro: ${error.message}`, error: true }); setSaving(false); return; }
    }

    setSaving(false);
    setModalVisible(false);
    loadData();
  }

  async function handleDelete(ctx: Contexto) {
    const { error } = await supabase.from("contextos").delete().eq("id", ctx.id);
    if (error) setMessage({ text: `Erro: ${error.message}`, error: true });
    else loadData();
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
            {ctx.imagem_url ? (
              <Image source={{ uri: ctx.imagem_url }} style={styles.cardThumb} />
            ) : (
              <View style={[styles.iconCircle, { backgroundColor: ctx.cor || "#1E3A5F" }]}>
                <MaterialIcons name={(ctx.icone as any) || "category"} size={24} color="#FFF" />
              </View>
            )}
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
              <Text style={styles.modalTitle}>{editingId ? "Editar Contexto" : "Novo Contexto"}</Text>

              <View style={styles.photoRow}>
                <ImageUpload
                  currentUrl={imagemUrl}
                  bucket="images"
                  folder="contextos"
                  onUploaded={setImagemUrl}
                  size={80}
                  shape="rectangle"
                />
              </View>

              <TextInput style={styles.input} placeholder="Titulo" value={titulo} onChangeText={setTitulo} autoCapitalize="sentences" />
              <TextInput style={styles.input} placeholder="Subtitulo" value={subtitulo} onChangeText={setSubtitulo} autoCapitalize="sentences" />
              <TextInput style={styles.input} placeholder="Icone (nome MaterialIcons)" value={icone} onChangeText={setIcone} autoCapitalize="none" />
              <TextInput style={styles.input} placeholder="Cor (hex, ex: #1E3A5F)" value={cor} onChangeText={setCor} autoCapitalize="none" />
              <TextInput style={styles.input} placeholder="Cor clara (hex, ex: #E8F0FE)" value={corClara} onChangeText={setCorClara} autoCapitalize="none" />
              <TextInput style={styles.input} placeholder="Ordem (numero)" value={ordem} onChangeText={setOrdem} keyboardType="numeric" />

              <Text style={styles.promptLabel}>Prompt da IA (Análise e Aconselhamento)</Text>
              <TextInput
                style={[styles.input, styles.promptInput]}
                placeholder="Instruções personalizadas para a IA ao analisar este contexto. Ex: Foque em aspectos de socialização e autonomia..."
                value={prompt}
                onChangeText={setPrompt}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

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
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", marginRight: 12 },
  cardThumb: { width: 44, height: 44, borderRadius: 8, marginRight: 12 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: "600", color: "#1E3A5F" },
  cardSub: { fontSize: 13, color: "#666", marginTop: 2 },
  cardDate: { fontSize: 13, color: "#888", marginTop: 2 },
  iconBtn: { padding: 8, marginLeft: 4 },
  photoRow: { alignItems: "center", marginBottom: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center" },
  modalScroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  modalContent: { backgroundColor: "#FFF", borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#1E3A5F", marginBottom: 20 },
  input: { backgroundColor: "#F5F7FA", borderRadius: 12, padding: 14, fontSize: 16, color: "#333", marginBottom: 12 },
  promptLabel: { fontSize: 13, fontWeight: "600", color: "#666", marginBottom: 6 },
  promptInput: { minHeight: 100, paddingTop: 14 },
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
