import { Image, StyleSheet } from "react-native";

export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <Image
      source={require("../assets/logo.png")}
      style={[styles.logo, { width: size, height: size }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: { borderRadius: 6 },
});
