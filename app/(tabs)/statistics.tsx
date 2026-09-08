import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  BarChart3,
  ShieldAlert,
  ShieldCheck,
  Timer,
} from "lucide-react-native";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { PageHeader } from "../../components/headers/PageHeader";
import { ScreenShell } from "../../components/layout/ScreenShell";
import { StatCard } from "../../components/statistics/statCard";
import { StatisticsSection } from "../../components/statistics/StatisticsSection";
import type { AppColorPalette } from "../../constants/theme";
import { useAppTheme } from "../../contexts/ThemeContext";
import { useGetAllReports } from "../../hooks/useGetAllReports";
import { useStatistics } from "../../hooks/useStatistics";

export default function StatisticsScreen() {
  const router = useRouter();
  const { colors, surface } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, surface), [colors, surface]);

  const { reports, loading, refreshing, fetchReports } = useGetAllReports();

  const {
    totalReports,
    nonTraiteCount,
    enCoursCount,
    resoluCount,
    typesStats,
    urgencesStats,
    getPercentage,
  } = useStatistics(reports);

  if (loading && !refreshing) {
    return (
      <ScreenShell>
        <PageHeader
          title="Statistiques"
          subtitle="Vue globale des signalements"
          onBack={() => router.replace("/(tabs)/dashboard")}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryLight} />
          <Text style={styles.loadingText}>Chargement des statistiques...</Text>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <PageHeader
        title="Statistiques"
        subtitle="Vue globale des signalements"
        onBack={() => router.replace("/(tabs)/dashboard")}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchReports({ pullToRefresh: true })}
            tintColor={colors.primaryLight}
            colors={[colors.primaryLight]}
          />
        }
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mainCard}
        >
          <View style={styles.mainIconContainer}>
            <BarChart3 color="#ffffff" size={32} />
          </View>

          <Text style={styles.mainNumber}>{totalReports}</Text>
          <Text style={styles.mainLabel}>signalements au total</Text>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Répartition par statut</Text>

        <View style={styles.cardsGrid}>
          <StatCard
            title="Non traité"
            value={nonTraiteCount}
            percentage={getPercentage(nonTraiteCount)}
            color={colors.status.error}
            icon={<ShieldAlert color={colors.status.error} size={26} />}
          />

          <StatCard
            title="En cours"
            value={enCoursCount}
            percentage={getPercentage(enCoursCount)}
            color={colors.status.warning}
            icon={<Timer color={colors.status.warning} size={26} />}
          />

          <StatCard
            title="Résolu"
            value={resoluCount}
            percentage={getPercentage(resoluCount)}
            color={colors.status.success}
            icon={<ShieldCheck color={colors.status.success} size={26} />}
          />
        </View>

        <Text style={styles.sectionTitle}>Types de harcèlement</Text>

        <StatisticsSection
          title="Répartition par type"
          data={typesStats}
          color={colors.primaryLight}
          getPercentage={getPercentage}
        />

        <Text style={styles.sectionTitle}>Niveaux d&apos;urgence</Text>

        <StatisticsSection
          title="Répartition par urgence"
          data={urgencesStats}
          color={colors.status.error}
          getPercentage={getPercentage}
        />
      </ScrollView>
    </ScreenShell>
  );
}

function createStyles(colors: AppColorPalette, surface: string) {
  return StyleSheet.create({
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      marginTop: 12,
      color: colors.textMuted,
      fontSize: 14,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    mainCard: {
      borderRadius: 20,
      padding: 24,
      alignItems: "center",
      marginBottom: 24,
      elevation: 4,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.25)",
    },
    mainIconContainer: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    mainNumber: {
      color: "#ffffff",
      fontSize: 42,
      fontWeight: "900",
    },
    mainLabel: {
      color: "rgba(255,255,255,0.9)",
      fontSize: 15,
      fontWeight: "600",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 12,
      marginTop: 8,
    },
    cardsGrid: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 22,
    },
  });
}
