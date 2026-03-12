import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

// =====================================================
// CONFIGURAÇÃO — Troque pelos seus dados do Supabase
// Vá em Settings → API Keys no painel do Supabase
// =====================================================

const SUPABASE_URL = "https://SEU_PROJETO.supabase.co";
const SUPABASE_ANON_KEY = "SUA_PUBLISHABLE_KEY_AQUI";

let storage: any = undefined;

if (Platform.OS !== "web") {
  const AsyncStorage = require("@react-native-async-storage/async-storage").default;
  storage = AsyncStorage;
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: Platform.OS !== "web",
    detectSessionInUrl: false,
  },
});
