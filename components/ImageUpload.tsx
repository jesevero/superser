import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRef } from "react";
import { supabase } from "../data/supabase";

type Props = {
  currentUrl: string | null;
  bucket: string;
  folder: string;
  onUploaded: (url: string) => void;
  size?: number;
  shape?: "circle" | "rectangle";
};

export default function ImageUpload({ currentUrl, bucket, folder, onUploaded, size = 100, shape = "circle" }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function uploadFile(file: File) {
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${folder}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (error) {
      console.log("Upload error:", error.message);
      return;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    if (urlData?.publicUrl) {
      onUploaded(urlData.publicUrl);
    }
  }

  function handlePress() {
    if (Platform.OS === "web") {
      fileInputRef.current?.click();
    }
  }

  function handleFileChange(e: any) {
    const file = e.target?.files?.[0];
    if (file) uploadFile(file);
  }

  const isCircle = shape === "circle";
  const containerStyle = isCircle
    ? { width: size, height: size, borderRadius: size / 2 }
    : { width: size * 2, height: size, borderRadius: 12 };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity onPress={handlePress} style={[styles.container, containerStyle]} activeOpacity={0.7}>
        {currentUrl ? (
          <Image
            source={{ uri: currentUrl }}
            style={[styles.image, containerStyle]}
          />
        ) : (
          <View style={[styles.placeholder, containerStyle]}>
            <MaterialIcons name="add-a-photo" size={size * 0.3} color="#999" />
            <Text style={styles.placeholderText}>Foto</Text>
          </View>
        )}
        <View style={[styles.editBadge, isCircle ? { bottom: 0, right: 0 } : { bottom: 4, right: 4 }]}>
          <MaterialIcons name="edit" size={14} color="#FFF" />
        </View>
      </TouchableOpacity>
      {Platform.OS === "web" && (
        <input
          ref={fileInputRef as any}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "center" },
  container: { overflow: "hidden", backgroundColor: "#F0F0F0" },
  image: { width: "100%", height: "100%" },
  placeholder: { justifyContent: "center", alignItems: "center", backgroundColor: "#F0F0F0" },
  placeholderText: { fontSize: 10, color: "#999", marginTop: 2 },
  editBadge: { position: "absolute", width: 24, height: 24, borderRadius: 12, backgroundColor: "#1E3A5F", justifyContent: "center", alignItems: "center" },
});
