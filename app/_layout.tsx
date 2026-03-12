import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, createContext, useContext } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import * as Font from "expo-font";
import { View, ActivityIndicator } from "react-native";
import { supabase } from "../data/supabase";
import Logo from "./Logo";

type AuthState = {
  userId: string | null;
  avaliadorId: string | null;
  nome: string | null;
  perfil: string | null;
  ready: boolean;
};

const defaultAuth: AuthState = {
  userId: null,
  avaliadorId: null,
  nome: null,
  perfil: null,
  ready: false,
};

export const AuthContext = createContext<{
  auth: AuthState;
  setAuth: (a: AuthState) => void;
  logout: () => void;
}>({
  auth: defaultAuth,
  setAuth: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function HeaderLogo() {
  return (
    <View style={{ marginLeft: 8 }}>
      <Logo size={32} />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [auth, setAuth] = useState<AuthState>(defaultAuth);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    Font.loadAsync(MaterialIcons.font).then(() => setFontsLoaded(true));
  }, []);

  // Check existing session on app start
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const avaliador = await loadAvaliador(session.user.id);
        if (avaliador) {
          setAuth({ ...avaliador, ready: true });
          return;
        }
      }
    } catch (e) {
      console.log("Erro ao verificar sessão:", e);
    }
    setAuth({ ...defaultAuth, ready: true });
  }

  async function loadAvaliador(authId: string) {
    try {
      const { data, error } = await supabase
        .from("avaliadores")
        .select("*")
        .eq("auth_id", authId)
        .maybeSingle();

      if (error) {
        console.log("Erro ao buscar avaliador:", error.message);
        return null;
      }

      if (data) {
        return {
          userId: authId,
          avaliadorId: data.id,
          nome: data.nome,
          perfil: data.perfil,
        };
      }

      // Usuário autenticado mas sem perfil de avaliador - criar automaticamente
      console.log("Avaliador não encontrado, criando perfil...");
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: novo, error: insertErr } = await supabase
          .from("avaliadores")
          .insert({
            auth_id: authId,
            nome: user.email?.split("@")[0] || "Usuário",
            email: user.email || "",
            perfil: "familia",
          })
          .select()
          .single();

        if (insertErr) {
          console.log("Erro ao criar avaliador:", insertErr.message);
          return null;
        }

        if (novo) {
          return {
            userId: authId,
            avaliadorId: novo.id,
            nome: novo.nome,
            perfil: novo.perfil,
          };
        }
      }
    } catch (e) {
      console.log("Exceção em loadAvaliador:", e);
    }
    return null;
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setAuth({ ...defaultAuth, ready: true });
  }

  // Redirect based on auth
  useEffect(() => {
    if (!auth.ready) return;
    const onLogin = segments[0] === "login";

    if (!auth.userId && !onLogin) {
      router.replace("/login");
    } else if (auth.userId && onLogin) {
      router.replace("/criancas");
    }
  }, [auth.ready, auth.userId, segments]);

  if (!fontsLoaded || !auth.ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1E3A5F" }}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  const contextValue = {
    auth,
    setAuth,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#1E3A5F" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          contentStyle: { backgroundColor: "#F5F7FA" },
          headerLeft: () => <HeaderLogo />,
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ title: "SuperSer" }} />
        <Stack.Screen name="criancas" options={{ title: "Selecionar Criança" }} />
        <Stack.Screen name="context/[id]" options={{ title: "" }} />
        <Stack.Screen name="avaliar/[contextId]/[categoryIndex]" options={{ title: "Avaliar", presentation: "modal" }} />
        <Stack.Screen name="historico/[contextId]" options={{ title: "Histórico" }} />
      </Stack>
    </AuthContext.Provider>
  );
}
