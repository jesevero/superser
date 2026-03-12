export default {
  expo: {
    name: "SuperSer",
    slug: "superser",
    version: "2.0.0",
    orientation: "portrait",
    scheme: "superser",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      backgroundColor: "#1E3A5F",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.superser.app",
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#1E3A5F",
      },
      package: "com.superser.app",
    },
    web: {
      bundler: "metro",
      output: "static",
    },
    plugins: ["expo-router"],
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
};
