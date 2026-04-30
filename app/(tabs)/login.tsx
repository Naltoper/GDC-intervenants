import { GradientButton } from "../../components/buttons/GradientButton";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Lock, Mail, ShieldCheck } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

/**
 * Sous-composant pour les champs de saisie (Refactorisation)
 */
const InputField = ({
  icon: Icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
}: any) => (
  <View style={styles.inputWrapper}>
    <Icon color="#48a4f4" size={20} style={styles.inputIcon} />
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize="none"
    />
  </View>
);

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Note : On pourra ajouter la logique Supabase Auth ici plus tard
    router.replace("/(tabs)/dashboard");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.safeArea}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/")}
        >
          <ArrowLeft color="#023e8a" size={28} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Espace Intervenants</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>
            Veuillez vous identifier pour accéder à la gestion des signalements.
          </Text>
        </View>

        <View style={styles.form}>
          <InputField
            icon={Mail}
            placeholder="Email professionnel"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <InputField
            icon={Lock}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View style={styles.buttonContainer}>
            <GradientButton
              title="SE CONNECTER"
              colors={["#48a4f4", "#10ac56"]}
              onPress={handleLogin}
              width="100%"
              height={80}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.securityBadge}>
            <ShieldCheck size={16} color="#0077b6" />
            <Text style={styles.footerNote}> Connexion sécurisée SSL</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },
  container: { flexGrow: 1, padding: 24, justifyContent: "center" },
  backButton: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  header: { alignItems: "center", marginBottom: 50 },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#023e8a",
    textAlign: "center",
  },
  divider: {
    width: 40,
    height: 4,
    backgroundColor: "#10ac56",
    borderRadius: 2,
    marginVertical: 15,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  form: { width: "100%", gap: 15 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 60,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 2,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: "#1e293b", fontSize: 16 },
  buttonContainer: { marginTop: 10 },
  footer: { marginTop: 40, alignItems: "center" },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  footerNote: { fontSize: 13, color: "#0077b6", fontWeight: "600" },
});
