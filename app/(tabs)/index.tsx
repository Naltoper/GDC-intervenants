import { useRouter } from "expo-router";
import { ChevronRight, Lock, Shield } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { InstallBanner } from "../../components/banners/InstallBanner";
import { PageHeader } from "../../components/headers/PageHeader";
import type { AppColorPalette } from "../../constants/theme";
import { HeaderThemeToggle } from "../../components/navigation/HeaderThemeToggle";
import { useAppTheme } from "../../contexts/ThemeContext";
import { usePullToRefresh } from "../../hooks/usePullToRefresh";

const TEXT_ON_PRIMARY = "#FFFFFF";
const HOME_BG_FADE_MS = 420;
const HOME_BG_DAY = require("../../assets/images/lyceeBg.jpg");
const HOME_BG_NIGHT = require("../../assets/images/lyceeBgNight.png");
const HOME_OVERLAY_LIGHT = [
  "rgba(213, 237, 236, 0.28)",
  "rgba(213, 237, 236, 0.55)",
] as const;
const HOME_OVERLAY_DARK = [
  "rgba(0, 0, 0, 0.4)",
  "rgba(0, 0, 0, 0.55)",
] as const;
const HOME_DARK_SCRIM = "rgba(0, 0, 0, 0.40)";

function createStyles(colors: AppColorPalette, surface: string) {
  return StyleSheet.create({
    screenRoot: {
      flex: 1,
      width: "100%",
      height: "100%",
      backgroundColor: surface,
      overflow: "hidden",
    },
    homeBgStack: {
      ...StyleSheet.absoluteFillObject,
    },
    homeBgImage: {
      ...StyleSheet.absoluteFillObject,
      width: "100%",
      height: "100%",
    },
    homeDarkScrim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: HOME_DARK_SCRIM,
    },
    homeOverlay: {
      flex: 1,
    },
    container: {
      flexGrow: 1,
      padding: 20,
      paddingTop: 16,
      paddingBottom: 48,
    },
    header: {
      alignItems: "center",
      marginBottom: 20,
      paddingTop: 8,
    },
    logoContainer: {
      width: 170,
      height: 200,
      borderRadius: 60,
      backgroundColor: surface,
      marginBottom: 16,
      overflow: "hidden",
      borderWidth: 3,
      borderColor: colors.primaryLight,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 6,
      justifyContent: "center",
      alignItems: "center",
      padding: 3,
    },
    logo: {
      width: "100%",
      height: "100%",
      borderRadius: 55,
    },
    headerTitle: {
      fontSize: 34,
      fontWeight: "800",
      color: colors.accent,
      textAlign: "center",
      letterSpacing: 0.3,
      lineHeight: 40,
    },
    engagementCard: {
      flexDirection: "row",
      backgroundColor: surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 14,
      alignItems: "flex-start",
      width: "100%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    engagementIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.borderSubtle,
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
    },
    engagementTextWrap: {
      flex: 1,
    },
    engagementTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    engagementDesc: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 19,
    },
    actionsCard: {
      backgroundColor: surface,
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    actionsHeading: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 14,
    },
    primaryTile: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 18,
      gap: 14,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 5,
    },
    primaryIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 14,
      backgroundColor: "rgba(255,255,255,0.15)",
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
    },
    primaryTextWrap: {
      flex: 1,
    },
    primaryTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: TEXT_ON_PRIMARY,
      marginBottom: 3,
    },
    primarySubtitle: {
      fontSize: 13,
      color: "rgba(255,255,255,0.75)",
      lineHeight: 18,
    },
    footerBadges: {
      marginTop: 28,
      alignItems: "center",
      width: "100%",
    },
    securityBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: surface,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    footerNote: {
      fontSize: 15,
      color: colors.accent,
      fontWeight: "600",
    },
    footerSubtitle: {
      marginTop: 12,
      fontSize: 11,
      color: colors.text,
      textTransform: "uppercase",
      letterSpacing: 2,
      fontWeight: "600",
      textAlign: "center",
    },
  });
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors, surface, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, surface), [colors, surface]);
  const [refreshing, setRefreshing] = useState(false);
  const nightOpacity = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(nightOpacity, {
      toValue: isDark ? 1 : 0,
      duration: HOME_BG_FADE_MS,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isDark, nightOpacity]);

  const pullRefresh = usePullToRefresh({
    refreshing,
    onRefresh: async () => {
      setRefreshing(true);
      await new Promise((resolve) => setTimeout(resolve, 400));
      setRefreshing(false);
    },
    tintColor: colors.primaryLight,
  });

  return (
    <View style={styles.screenRoot}>
      <View style={styles.homeBgStack} pointerEvents="none">
        <Image
          source={HOME_BG_DAY}
          style={styles.homeBgImage}
          resizeMode="cover"
        />
        <Animated.Image
          source={HOME_BG_NIGHT}
          style={[styles.homeBgImage, { opacity: nightOpacity }]}
          resizeMode="cover"
        />
      </View>

      <Animated.View
        style={[styles.homeDarkScrim, { opacity: nightOpacity }]}
        pointerEvents="none"
      />

      <LinearGradient
        colors={[...(isDark ? HOME_OVERLAY_DARK : HOME_OVERLAY_LIGHT)]}
        style={styles.homeOverlay}
      >
        <PageHeader
          title="Accueil"
          subtitle="Les Gardiens des Calanques"
          left={<HeaderThemeToggle />}
        />

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          {...pullRefresh}
        >
          <InstallBanner
            title="Application Intervenants"
            subtitle="Installez l'app pour recevoir les alertes en direct."
            url="https://github.com/Naltoper/GDC-intervenants_start/releases/download/v1.0.0/GDC-Intervenants.apk"
          />

          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/images/logo.jpg")}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.headerTitle}>Les Gardiens des Calanques</Text>
          </View>

          <View style={styles.engagementCard}>
            <View style={styles.engagementIconWrap}>
              <Shield color={colors.accent} size={22} strokeWidth={2.5} />
            </View>
            <View style={styles.engagementTextWrap}>
              <Text style={styles.engagementTitle}>
                Espace de gestion et suivi
              </Text>
              <Text style={styles.engagementDesc}>
                Analysez les signalements reçus, échangez en toute sécurité avec
                les élèves et agissez au sein de la cellule pour briser le
                silence.
              </Text>
            </View>
          </View>

          <View style={styles.actionsCard}>
            <Text style={styles.actionsHeading}>Accès intervenants</Text>
            <TouchableOpacity
              style={styles.primaryTile}
              onPress={() => router.push("/(tabs)/login")}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel="Espace Intervenants"
            >
              <View style={styles.primaryIconWrap}>
                <Lock color={TEXT_ON_PRIMARY} size={28} strokeWidth={2.5} />
              </View>
              <View style={styles.primaryTextWrap}>
                <Text style={styles.primaryTitle}>Espace Intervenants</Text>
                <Text style={styles.primarySubtitle}>
                  Se connecter pour gérer les signalements
                </Text>
              </View>
              <ChevronRight
                size={22}
                color="rgba(255,255,255,0.7)"
                strokeWidth={2.5}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.footerBadges}>
            <View style={styles.securityBadge}>
              <Shield size={14} color={colors.accent} />
              <Text style={styles.footerNote}>Anonymat garanti</Text>
            </View>
          </View>
          <Text style={styles.footerSubtitle}>
            Lycée des Calanques • Marseille
          </Text>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
