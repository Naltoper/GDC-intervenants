import { useRouter } from "expo-router";
import { Lock, Mail, ShieldCheck } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { GradientButton } from "../../components/buttons/GradientButton";
import { PageHeader } from "../../components/headers/PageHeader";
import { ScreenShell } from "../../components/layout/ScreenShell";
import type { AppColorPalette } from "../../constants/theme";
import { useAppTheme } from "../../contexts/ThemeContext";

type InputFieldProps = {
  icon: React.ComponentType<{ color: string; size: number; style?: object }>;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  colors: AppColorPalette;
  surface: string;
};

const InputField = ({
  icon: Icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  colors,
  surface,
}: InputFieldProps) => (
  <View
    style={[
      styles.inputWrapper,
      {
        backgroundColor: surface,
        borderColor: colors.border,
      },
    ]}
  >
    <Icon color={colors.primaryLight} size={20} style={styles.inputIcon} />
    <TextInput
      style={[styles.input, { color: colors.text }]}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
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
  const { colors, surface } = useAppTheme();
  const themed = useMemo(() => createStyles(colors, surface), [colors, surface]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    router.replace("/(tabs)/dashboard");
  };

  return (
    <ScreenShell>
      <PageHeader
        title="Espace Intervenants"
        subtitle="Identification sécurisée"
        onBack={() => router.replace("/")}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={themed.flex}
      >
        <ScrollView contentContainerStyle={themed.container}>
          <Text style={themed.subtitle}>
            Veuillez vous identifier pour accéder à la gestion des signalements.
          </Text>

          <View style={themed.form}>
            <InputField
              icon={Mail}
              placeholder="Email professionnel"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              colors={colors}
              surface={surface}
            />

            <InputField
              icon={Lock}
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              colors={colors}
              surface={surface}
            />

            <View style={themed.buttonContainer}>
              <GradientButton
                title="SE CONNECTER"
                onPress={handleLogin}
                colors={[colors.primary, colors.secondary]}
                width="100%"
                height={56}
                compact
              />
            </View>
          </View>

          <View style={themed.footer}>
            <View
              style={[
                themed.securityBadge,
                { backgroundColor: colors.borderSubtle, borderColor: colors.border },
              ]}
            >
              <ShieldCheck size={16} color={colors.accent} />
              <Text style={[themed.footerNote, { color: colors.accent }]}>
                {" "}
                Connexion sécurisée SSL
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

function createStyles(colors: AppColorPalette, _surface: string) {
  return StyleSheet.create({
    flex: { flex: 1 },
    container: { flexGrow: 1, padding: 24, justifyContent: "center" },
    subtitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      textAlign: "center",
      paddingHorizontal: 12,
      lineHeight: 22,
      marginBottom: 28,
    },
    form: { width: "100%", gap: 15 },
    buttonContainer: { marginTop: 10 },
    footer: { marginTop: 40, alignItems: "center" },
    securityBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    footerNote: { fontSize: 13, fontWeight: "600" },
  });
}

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 60,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16 },
});
