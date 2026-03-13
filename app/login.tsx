import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../data/supabase";
import { useAuth } from "./_layout";
import Logo from "./Logo";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [nome, setNome] = useState("");
  const { setAuth } = useAuth();
  const router = useRouter();

  async function doLogin(loginEmail: string, loginSenha: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginSenha,
    });

    if (error) {
      Alert.alert("Erro ao entrar", error.message);
      return false;
    }

    if (!data.user) {
      Alert.alert("Erro", "Não foi possível autenticar.");
      return false;
    }

    // Buscar ou criar perfil do avaliador
    let avaliador = null;

    // 1. Try by auth_id
    const { data: existente } = await supabase
      .from("avaliadores")
      .select("*")
      .eq("auth_id", data.user.id)
      .maybeSingle();

    if (existente) {
      avaliador = existente;
    } else {
      // 2. Try by email (admin may have pre-created the avaliador without auth_id)
      const { data: byEmail } = await supabase
        .from("avaliadores")
        .select("*")
        .eq("email", loginEmail)
        .is("auth_id", null)
        .maybeSingle();

      if (byEmail) {
        // Link the existing avaliador to this auth account
        await supabase.from("avaliadores").update({ auth_id: data.user.id }).eq("id", byEmail.id);
        avaliador = { ...byEmail, auth_id: data.user.id };
      } else {
        // 3. Create new avaliador
        const { data: novo, error: insertErr } = await supabase
          .from("avaliadores")
          .insert({
            auth_id: data.user.id,
            nome: nome || loginEmail.split("@")[0],
            email: loginEmail,
            perfil: "familia",
          })
          .select()
          .single();

        if (insertErr) {
          console.log("Erro ao criar perfil:", insertErr.message);
          avaliador = { id: data.user.id, nome: loginEmail.split("@")[0], perfil: "familia" };
        } else {
          avaliador = novo;
        }
      }
    }

    // Atualizar estado de auth
    setAuth({
      userId: data.user.id,
      avaliadorId: avaliador.id,
      nome: avaliador.nome,
      perfil: avaliador.perfil,
      ready: true,
    });

    // Navegar para seleção de criança
    router.replace("/criancas");
    return true;
  }

  async function handleLogin() {
    if (!email || !senha) {
      Alert.alert("Atenção", "Preencha email e senha.");
      return;
    }
    setLoading(true);
    await doLogin(email, senha);
    setLoading(false);
  }

  async function handleCadastro() {
    if (!email || !senha || !nome) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }
    if (senha.length < 6) {
      Alert.alert("Atenção", "A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (authError) {
      setLoading(false);
      Alert.alert("Erro ao cadastrar", authError.message);
      return;
    }

    // Se o Supabase exigir confirmação por email
    if (authData.user && !authData.session) {
      setLoading(false);
      Alert.alert(
        "Verifique seu email",
        "Enviamos um link de confirmação para " + email + ". Após confirmar, volte e faça login.",
      );
      setModo("login");
      return;
    }

    // Se auto-confirm está habilitado, fazer login direto
    if (authData.session) {
      await doLogin(email, senha);
    }

    setLoading(false);
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ImageBackground source={require("../assets/banner.jpg")} style={styles.header} resizeMode="cover">
        <View style={styles.headerOverlay}>
          <Logo size={80} />
          <Text style={styles.title}>SuperSer</Text>
          <Text style={styles.subtitle}>Acompanhamento Comportamental{"\n"}e do Desenvolvimento</Text>
        </View>
      </ImageBackground>

      <View style={styles.form}>
        <Text style={styles.formTitle}>{modo === "login" ? "Entrar" : "Criar Conta"}</Text>

        {modo === "cadastro" && (
          <View style={styles.inputGroup}>
            <MaterialIcons name="person" size={20} color="#999" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Seu nome completo" placeholderTextColor="#BBB" value={nome} onChangeText={setNome} autoCapitalize="words" />
          </View>
        )}

        <View style={styles.inputGroup}>
          <MaterialIcons name="email" size={20} color="#999" style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#BBB" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        </View>

        <View style={styles.inputGroup}>
          <MaterialIcons name="lock" size={20} color="#999" style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#BBB" value={senha} onChangeText={setSenha} secureTextEntry />
        </View>

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={modo === "login" ? handleLogin : handleCadastro} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Aguarde..." : modo === "login" ? "Entrar" : "Criar Conta"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.switchMode} onPress={() => setModo(modo === "login" ? "cadastro" : "login")}>
          <Text style={styles.switchText}>{modo === "login" ? "Não tem conta? Criar agora" : "Já tem conta? Entrar"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1E3A5F" },
  header: { flex: 1, width: "100%" },
  headerOverlay: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 60, backgroundColor: "rgba(30, 58, 95, 0.7)" },
  title: { fontSize: 32, fontWeight: "800", color: "#FFF", marginTop: 16 },
  subtitle: { fontSize: 14, color: "#AAC4E0", textAlign: "center", marginTop: 6, lineHeight: 20 },
  form: { backgroundColor: "#FFF", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 40 },
  formTitle: { fontSize: 22, fontWeight: "700", color: "#1E3A5F", marginBottom: 20 },
  inputGroup: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F7FA", borderRadius: 12, marginBottom: 14, paddingHorizontal: 14 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: "#333" },
  button: { backgroundColor: "#1E3A5F", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  switchMode: { alignItems: "center", marginTop: 16 },
  switchText: { color: "#2962A0", fontSize: 14, fontWeight: "600" },
});
