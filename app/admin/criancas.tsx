import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Modal, Image, Platform } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../_layout";
import { supabase } from "../../data/supabase";
import ImageUpload from "../../components/ImageUpload";

type Crianca = {
  id: string;
  nome: string;
  data_nascimento: string | null;
  foto_url: string | null;
  email_responsavel: string | null;
  whatsapp: string | null;
};

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function DatePicker({ value, onChange }: { value: string; onChange: (d: string) => void }) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const parsed = value ? new Date(value + "T12:00:00") : null;
  const [year, setYear] = useState(parsed ? parsed.getFullYear() : today.getFullYear() - 5);
  const [month, setMonth] = useState(parsed ? parsed.getMonth() : today.getMonth());
  const [day, setDay] = useState(parsed ? parsed.getDate() : 1);

  function daysInMonth(y: number, m: number) {
    return new Date(y, m + 1, 0).getDate();
  }

  function confirm() {
    const maxDay = daysInMonth(year, month);
    const d = Math.min(day, maxDay);
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    onChange(iso);
    setOpen(false);
  }

  function formatDisplay(iso: string): string {
    const d = new Date(iso + "T12:00:00");
    return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
  }

  const currentYear = today.getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);
  const maxDay = daysInMonth(year, month);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  return (
    <>
      <TouchableOpacity style={dpStyles.trigger} onPress={() => setOpen(true)}>
        <MaterialIcons name="calendar-today" size={20} color="#1E3A5F" />
        <Text style={[dpStyles.triggerText, !value && dpStyles.placeholder]}>
          {value ? formatDisplay(value) : "Selecionar data de nascimento"}
        </Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <View style={dpStyles.overlay}>
          <View style={dpStyles.card}>
            <Text style={dpStyles.title}>Data de Nascimento</Text>

            <View style={dpStyles.row}>
              {/* Day */}
              <View style={dpStyles.col}>
                <Text style={dpStyles.label}>Dia</Text>
                <ScrollView style={dpStyles.scroll} showsVerticalScrollIndicator={false}>
                  {days.map((d) => (
                    <TouchableOpacity key={d} style={[dpStyles.option, d === day && dpStyles.optionActive]} onPress={() => setDay(d)}>
                      <Text style={[dpStyles.optionText, d === day && dpStyles.optionTextActive]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month */}
              <View style={[dpStyles.col, { flex: 2 }]}>
                <Text style={dpStyles.label}>Mês</Text>
                <ScrollView style={dpStyles.scroll} showsVerticalScrollIndicator={false}>
                  {MONTHS.map((m, i) => (
                    <TouchableOpacity key={i} style={[dpStyles.option, i === month && dpStyles.optionActive]} onPress={() => setMonth(i)}>
                      <Text style={[dpStyles.optionText, i === month && dpStyles.optionTextActive]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Year */}
              <View style={dpStyles.col}>
                <Text style={dpStyles.label}>Ano</Text>
                <ScrollView style={dpStyles.scroll} showsVerticalScrollIndicator={false}>
                  {years.map((y) => (
                    <TouchableOpacity key={y} style={[dpStyles.option, y === year && dpStyles.optionActive]} onPress={() => setYear(y)}>
                      <Text style={[dpStyles.optionText, y === year && dpStyles.optionTextActive]}>{y}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={dpStyles.actions}>
              <TouchableOpacity style={dpStyles.cancelBtn} onPress={() => setOpen(false)}>
                <Text style={dpStyles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={dpStyles.clearBtn} onPress={() => { onChange(""); setOpen(false); }}>
                <Text style={dpStyles.clearText}>Limpar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={dpStyles.confirmBtn} onPress={confirm}>
                <Text style={dpStyles.confirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const dpStyles = StyleSheet.create({
  trigger: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F7FA", borderRadius: 12, padding: 14, marginBottom: 12, gap: 10 },
  triggerText: { fontSize: 16, color: "#333" },
  placeholder: { color: "#BBB" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 24 },
  card: { backgroundColor: "#FFF", borderRadius: 16, padding: 20 },
  title: { fontSize: 18, fontWeight: "700", color: "#1E3A5F", marginBottom: 16, textAlign: "center" },
  row: { flexDirection: "row", gap: 8, height: 200 },
  col: { flex: 1 },
  label: { fontSize: 12, fontWeight: "600", color: "#888", marginBottom: 6, textAlign: "center" },
  scroll: { flex: 1 },
  option: { paddingVertical: 8, paddingHorizontal: 6, borderRadius: 8, alignItems: "center" },
  optionActive: { backgroundColor: "#1E3A5F" },
  optionText: { fontSize: 14, color: "#444" },
  optionTextActive: { color: "#FFF", fontWeight: "700" },
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#DDD", alignItems: "center" },
  cancelText: { color: "#666", fontWeight: "600" },
  clearBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#CC0000", alignItems: "center" },
  clearText: { color: "#CC0000", fontWeight: "600" },
  confirmBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: "#1E3A5F", alignItems: "center" },
  confirmText: { color: "#FFF", fontWeight: "700" },
});

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
  const [emailResp, setEmailResp] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
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
    setEmailResp("");
    setWhatsapp("");
    setMessage(null);
    setModalVisible(true);
  }

  function openEdit(c: Crianca) {
    setEditingId(c.id);
    setNome(c.nome);
    setDataNasc(c.data_nascimento || "");
    setFotoUrl(c.foto_url);
    setEmailResp(c.email_responsavel || "");
    setWhatsapp(c.whatsapp || "");
    setMessage(null);
    setModalVisible(true);
  }

  async function handleSave() {
    if (!nome.trim()) { setMessage({ text: "Informe o nome.", error: true }); return; }
    setSaving(true);
    setMessage(null);

    const row: any = {
      nome: nome.trim(),
      foto_url: fotoUrl || null,
      data_nascimento: dataNasc.trim() || null,
      email_responsavel: emailResp.trim() || null,
      whatsapp: whatsapp.trim() || null,
    };

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
          <Text style={styles.title}>{criancas.length} criança(s)</Text>
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
              {c.whatsapp && (
                <View style={styles.cardContactRow}>
                  <MaterialIcons name="phone" size={12} color="#2E7D32" />
                  <Text style={styles.cardContact}>{c.whatsapp}</Text>
                </View>
              )}
              {c.email_responsavel && (
                <View style={styles.cardContactRow}>
                  <MaterialIcons name="email" size={12} color="#1E3A5F" />
                  <Text style={styles.cardContact}>{c.email_responsavel}</Text>
                </View>
              )}
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
              <Text style={styles.modalTitle}>{editingId ? "Editar Criança" : "Nova Criança"}</Text>

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

              <Text style={styles.fieldLabel}>Nome</Text>
              <TextInput style={styles.input} placeholder="Nome completo" value={nome} onChangeText={setNome} autoCapitalize="words" />

              <Text style={styles.fieldLabel}>Data de Nascimento</Text>
              <DatePicker value={dataNasc} onChange={setDataNasc} />

              <Text style={styles.fieldLabel}>E-mail do Responsável</Text>
              <TextInput
                style={styles.input}
                placeholder="email@exemplo.com"
                value={emailResp}
                onChangeText={setEmailResp}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.fieldLabel}>WhatsApp</Text>
              <View style={styles.whatsappRow}>
                <MaterialIcons name="phone" size={20} color="#2E7D32" />
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="(11) 99999-9999"
                  value={whatsapp}
                  onChangeText={setWhatsapp}
                  keyboardType="phone-pad"
                />
              </View>

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
  cardContactRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  cardContact: { fontSize: 12, color: "#888" },
  iconBtn: { padding: 8, marginLeft: 4 },
  photoRow: { alignItems: "center", marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#666", marginBottom: 6 },
  whatsappRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
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
