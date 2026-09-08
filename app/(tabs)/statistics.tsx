import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  BarChart3,
  MessageSquareText,
  ShieldAlert,
  ShieldCheck,
  Timer,
  Users,
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
import { MetricTile } from "../../components/statistics/MetricTile";
import { StatCard } from "../../components/statistics/statCard";
import { StatisticsSection } from "../../components/statistics/StatisticsSection";
import type { AppColorPalette } from "../../constants/theme";
import { useAppTheme } from "../../contexts/ThemeContext";
import { useGetAllReports } from "../../hooks/useGetAllReports";
import { useModerationStats } from "../../hooks/useModerationStats";
import { useStatistics } from "../../hooks/useStatistics";

export default function StatisticsScreen() {
  const router = useRouter();
  const { colors, surface } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, surface), [colors, surface]);

  const { reports, loading, refreshing, fetchReports } = useGetAllReports();
  const moderation = useModerationStats();

  const {
    totalReports,
    nonTraiteCount,
    enCoursCount,
    resoluCount,
    typesStats,
    urgencesStats,
    lieuxStats,
    frequencesStats,
    victimesStats,
    anonymatStats,
    thisWeekCount,
    thisMonthCount,
    thisYearCount,
    todayCount,
    withAttachmentCount,
    getPercentage,
  } = useStatistics(reports);

  const refreshAll = async () => {
    await Promise.all([
      fetchReports({ pullToRefresh: true }),
      moderation.refresh(),
    ]);
  };

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
            onRefresh={refreshAll}
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

        <Text style={styles.sectionTitle}>Évolution temporelle</Text>
        <View style={styles.metricsGrid}>
          <MetricTile
            label="Aujourd'hui"
            value={String(todayCount)}
            hint="nouveaux signalements"
            accent={colors.accent}
          />
          <MetricTile
            label="Cette semaine"
            value={String(thisWeekCount)}
            hint="7 derniers jours"
            accent={colors.primaryLight}
          />
          <MetricTile
            label="Ce mois"
            value={String(thisMonthCount)}
            hint="depuis le 1er"
            accent={colors.secondary}
          />
          <MetricTile
            label="Cette année"
            value={String(thisYearCount)}
            hint={`depuis janvier ${new Date().getFullYear()}`}
            accent={colors.status.success}
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

        <Text style={styles.sectionTitle}>Lieux des faits</Text>
        <StatisticsSection
          title="Répartition par lieu"
          data={lieuxStats}
          color={colors.accent}
          getPercentage={getPercentage}
        />

        <Text style={styles.sectionTitle}>Fréquence</Text>
        <StatisticsSection
          title="Répartition par fréquence"
          data={frequencesStats}
          color={colors.status.warning}
          getPercentage={getPercentage}
        />

        <Text style={styles.sectionTitle}>Victimes</Text>
        <StatisticsSection
          title="Nombre de victimes déclarées"
          data={victimesStats}
          color={colors.secondary}
          getPercentage={getPercentage}
        />

        <Text style={styles.sectionTitle}>Anonymat & pièces jointes</Text>
        <View style={styles.metricsGrid}>
          <MetricTile
            label="Anonymes"
            value={String(anonymatStats[0]?.[1] ?? 0)}
            hint={`${getPercentage(anonymatStats[0]?.[1] ?? 0)} % du total`}
            accent={colors.textMuted}
          />
          <MetricTile
            label="Identifiés"
            value={String(anonymatStats[1]?.[1] ?? 0)}
            hint={`${getPercentage(anonymatStats[1]?.[1] ?? 0)} % du total`}
            accent={colors.accent}
          />
          <MetricTile
            label="Avec image"
            value={String(withAttachmentCount)}
            hint={`${getPercentage(withAttachmentCount)} % du total`}
            accent={colors.primaryLight}
          />
          <MetricTile
            label="Sans image"
            value={String(Math.max(0, totalReports - withAttachmentCount))}
            hint={`${getPercentage(
              Math.max(0, totalReports - withAttachmentCount),
            )} % du total`}
            accent={colors.textMuted}
          />
        </View>

        <Text style={styles.sectionTitle}>Modération communauté</Text>
        <View style={styles.moderationCard}>
          <View style={styles.moderationHeader}>
            <Users size={18} color={colors.accent} strokeWidth={2.4} />
            <Text style={styles.moderationTitle}>Sujets</Text>
          </View>
          <View style={styles.moderationRow}>
            <ModerationChip
              label="En attente"
              value={moderation.stats.postsPending}
              color={colors.status.warning}
            />
            <ModerationChip
              label="Publiés"
              value={moderation.stats.postsPublished}
              color={colors.status.success}
            />
            <ModerationChip
              label="Refusés"
              value={moderation.stats.postsRefused}
              color={colors.status.error}
            />
          </View>

          <View style={[styles.moderationHeader, styles.moderationHeaderSpaced]}>
            <MessageSquareText size={18} color={colors.accent} strokeWidth={2.4} />
            <Text style={styles.moderationTitle}>Commentaires</Text>
          </View>
          <View style={styles.moderationRow}>
            <ModerationChip
              label="En attente"
              value={moderation.stats.commentsPending}
              color={colors.status.warning}
            />
            <ModerationChip
              label="Publiés"
              value={moderation.stats.commentsPublished}
              color={colors.status.success}
            />
            <ModerationChip
              label="Refusés"
              value={moderation.stats.commentsRefused}
              color={colors.status.error}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

function ModerationChip({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 8,
        alignItems: "center",
        backgroundColor: color + "18",
        borderWidth: 1,
        borderColor: color + "44",
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "900", color }}>{value}</Text>
      <Text
        style={{
          marginTop: 2,
          fontSize: 11,
          fontWeight: "700",
          color: colors.textMuted,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </View>
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
      overflow: "hidden",
      elevation: 4,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
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
    metricsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 22,
    },
    moderationCard: {
      backgroundColor: surface,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 18,
    },
    moderationHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },
    moderationHeaderSpaced: {
      marginTop: 16,
    },
    moderationTitle: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.text,
    },
    moderationRow: {
      flexDirection: "row",
      gap: 8,
    },
  });
}
