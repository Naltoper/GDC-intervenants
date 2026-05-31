import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import {
  BarChart3,
  ChevronLeft,
  ShieldAlert,
  ShieldCheck,
  Timer,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { APP_COLORS } from "../../constants/theme";
import { useGetAllReports } from "../../hooks/useGetAllReports";
const STATISTICS_COLOR = '#023e8a';
type StatEntry = [string, number];

export default function StatisticsScreen() {
  const router = useRouter();

  const { reports, loading, refreshing, fetchReports } = useGetAllReports();

  const totalReports = reports.length;

  const nonTraiteCount = reports.filter(
    (report) => report.status === "Non traité"
  ).length;

  const enCoursCount = reports.filter(
    (report) => report.status === "En cours"
  ).length;

  const resoluCount = reports.filter(
    (report) => report.status === "Résolu"
  ).length;

  const countByField = (fieldName: string): StatEntry[] => {
    const result: Record<string, number> = {};

    reports.forEach((report: any) => {
      const value = report[fieldName] || "Non renseigné";
      result[value] = (result[value] || 0) + 1;
    });

    return Object.entries(result);
  };

  const typesStats = countByField("type_harcelement");
  const urgencesStats = countByField("urgence");

  const getPercentage = (value: number) => {
    if (totalReports === 0) return 0;
    return Math.round((value / totalReports) * 100);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={APP_COLORS.primary} />
        <Text style={styles.loadingText}>
          Chargement des statistiques...
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/dashboard")}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ChevronLeft
              color={STATISTICS_COLOR}
              size={30}
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Statistiques</Text>
            <Text style={styles.subtitle}>
              Vue globale des signalements
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchReports}
              tintColor={APP_COLORS.primary}
              colors={[APP_COLORS.primary]}
            />
          }
        >
          <LinearGradient
            colors={[STATISTICS_COLOR, STATISTICS_COLOR]}            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainCard}
          >
            <View style={styles.mainIconContainer}>
              <BarChart3 color={APP_COLORS.white} size={32} />
            </View>

            <Text style={styles.mainNumber}>{totalReports}</Text>
            <Text style={styles.mainLabel}>
              signalements au total
             </Text>
          </LinearGradient>

          <Text style={styles.sectionTitle}>
            Répartition par statut
          </Text>

          <View style={styles.cardsGrid}>
            <StatCard
              title="Non traité"
              value={nonTraiteCount}
              percentage={getPercentage(nonTraiteCount)}
              color={APP_COLORS.status.pending}
              icon={
                <ShieldAlert
                  color={APP_COLORS.status.pending}
                  size={26}
                />
              }
            />

            <StatCard
              title="En cours"
              value={enCoursCount}
              percentage={getPercentage(enCoursCount)}
              color={APP_COLORS.status.inProgress}
              icon={
                <Timer
                  color={APP_COLORS.status.inProgress}
                  size={26}
                />
              }
            />

            <StatCard
              title="Résolu"
              value={resoluCount}
              percentage={getPercentage(resoluCount)}
              color={APP_COLORS.status.resolved}
              icon={
                <ShieldCheck
                  color={APP_COLORS.status.resolved}
                  size={26}
                />
              }
            />
          </View>

          <Text style={styles.sectionTitle}>
            Types de harcèlement
          </Text>

          <View style={styles.listCard}>
            {typesStats.length === 0 ? (
              <Text style={styles.emptyText}>
                Aucune donnée disponible.
              </Text>
            ) : (
              typesStats.map(([label, value]) => (
                <ProgressRow
                  key={label}
                  label={label}
                  value={value}
                  percentage={getPercentage(value)}
                  color={APP_COLORS.primary}
                />
              ))
            )}
          </View>

          <Text style={styles.sectionTitle}>
            Niveaux d'urgence
          </Text>

          <View style={styles.listCard}>
            {urgencesStats.length === 0 ? (
              <Text style={styles.emptyText}>
                Aucune donnée disponible.
              </Text>
            ) : (
              urgencesStats.map(([label, value]) => (
                <ProgressRow
                  key={label}
                  label={label}
                  value={value}
                  percentage={getPercentage(value)}
                  color={APP_COLORS.status.danger}
                />
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

function StatCard({
  title,
  value,
  percentage,
  color,
  icon,
}: {
  title: string;
  value: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>{icon}</View>

      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>

      <Text style={[styles.statPercentage, { color }]}>
        {percentage}%
      </Text>
    </View>
  );
}

function ProgressRow({
  label,
  value,
  percentage,
  color,
}: {
  label: string;
  value: number;
  percentage: number;
  color: string;
}) {
  return (
    <View style={styles.progressRow}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>
          {value} - {percentage}%
        </Text>
      </View>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    color: APP_COLORS.textMuted,
    fontSize: 14,
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: APP_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.primary,
  },

  backButton: {
    position: "absolute",
    left: 15,
    top: 45,
    padding: 10,
  },

  titleWrapper: {
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: STATISTICS_COLOR,
  },

  subtitle: {
    fontSize: 12,
    color: APP_COLORS.textMuted,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  mainCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    elevation: 4,
    shadowColor: STATISTICS_COLOR,    shadowOffset: { width: 0, height: 6 },
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
    color: APP_COLORS.white,
    fontSize: 42,
    fontWeight: "900",
  },

  mainLabel: {
    color: APP_COLORS.primary,
    fontSize: 15,
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: APP_COLORS.text,
    marginBottom: 12,
    marginTop: 8,
  },

  cardsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },

  statCard: {
    flex: 1,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },

  statIcon: {
    marginBottom: 8,
  },

  statValue: {
    fontSize: 24,
    fontWeight: "900",
    color: APP_COLORS.text,
  },

  statTitle: {
    fontSize: 12,
    color: APP_COLORS.textMuted,
    textAlign: "center",
    marginTop: 2,
  },

  statPercentage: {
    fontSize: 13,
    fontWeight: "800",
    marginTop: 6,
  },

  listCard: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },

  progressRow: {
    marginBottom: 16,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },

  progressLabel: {
    flex: 1,
    color: APP_COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },

  progressValue: {
    color: APP_COLORS.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },

  progressBackground: {
    height: 9,
    backgroundColor: APP_COLORS.border,
    borderRadius: 20,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 20,
  },

  emptyText: {
    color: APP_COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 10,
  },
});