import { Stack, useRouter } from "expo-router";
import { BarChart3, ChevronLeft, ShieldAlert, ShieldCheck, Timer } from "lucide-react-native";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useGetAllReports } from "../../hooks/useGetAllReports";

export default function StatisticsScreen() {
  const router = useRouter();

  const {
    reports,
    loading,
    refreshing,
    fetchReports,
  } = useGetAllReports();

  const totalReports = reports.length;

  const nonTraiteCount = reports.filter(
    (report) => report.status === "Non traité"
  ).length;

  const enCoursCount = reports.filter(
    (report) => report.status === "En cours"
  ).length;

  const traiteCount = reports.filter(
    (report) => report.status === "Résolu"
  ).length;

  const countByField = (fieldName: string) => {
    const result: Record<string, number> = {};

    reports.forEach((report: any) => {
      const value = report[fieldName] || "Non renseigné";

      if (!result[value]) {
        result[value] = 0;
      }

      result[value]++;
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
        <ActivityIndicator size="large" color="#023e8a" />
        <Text style={styles.loadingText}>Chargement des statistiques...</Text>
      </View>
    );
  }

  return (
    <>
        <Stack.Screen options={{headerShown: false}}/>
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/dashboard")}
          style={styles.backButton}
        >
          <ChevronLeft color="#023e8a" size={30} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Statistiques</Text>
          <Text style={styles.subtitle}>Vue globale des signalements</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchReports} />
        }
      >
        {/* TOTAL */}
        <View style={styles.mainCard}>
          <View style={styles.mainIconContainer}>
            <BarChart3 color="#ffffff" size={32} />
          </View>

          <Text style={styles.mainNumber}>{totalReports}</Text>
          <Text style={styles.mainLabel}>signalements au total</Text>
        </View>

        {/* STATUTS */}
        <Text style={styles.sectionTitle}>Répartition par statut</Text>

        <View style={styles.cardsGrid}>
          <StatCard
            title="Non traité"
            value={nonTraiteCount}
            percentage={getPercentage(nonTraiteCount)}
            color="#00b4d8"
            icon={<ShieldAlert color="#00b4d8" size={26} />}
          />

          <StatCard
            title="En cours"
            value={enCoursCount}
            percentage={getPercentage(enCoursCount)}
            color="#f59e0b"
            icon={<Timer color="#f59e0b" size={26} />}
          />

          <StatCard
            title="Résolu"
            value={traiteCount}
            percentage={getPercentage(traiteCount)}
            color="#10ac56"
            icon={<ShieldCheck color="#10ac56" size={26} />}
          />
        </View>

        {/* TYPES */}
        <Text style={styles.sectionTitle}>Types de harcèlement</Text>

        <View style={styles.listCard}>
          {typesStats.length === 0 ? (
            <Text style={styles.emptyText}>Aucune donnée disponible.</Text>
          ) : (
            typesStats.map(([label, value]) => (
              <ProgressRow
                key={label}
                label={label}
                value={value}
                percentage={getPercentage(value)}
                color="#023e8a"
              />
            ))
          )}
        </View>

        {/* URGENCES */}
        <Text style={styles.sectionTitle}>Niveaux d'urgence</Text>

        <View style={styles.listCard}>
          {urgencesStats.length === 0 ? (
            <Text style={styles.emptyText}>Aucune donnée disponible.</Text>
          ) : (
            urgencesStats.map(([label, value]) => (
              <ProgressRow
                key={label}
                label={label}
                value={value}
                percentage={getPercentage(value)}
                color="#dc2626"
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
    backgroundColor: "#f8fafc",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 14,
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
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
    color: "#023e8a",
  },

  subtitle: {
    fontSize: 12,
    color: "#64748b",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  mainCard: {
    backgroundColor: "#023e8a",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#023e8a",
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
    color: "#e0f2fe",
    fontSize: 15,
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
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
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  statIcon: {
    marginBottom: 8,
  },

  statValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
  },

  statTitle: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginTop: 2,
  },

  statPercentage: {
    fontSize: 13,
    fontWeight: "800",
    marginTop: 6,
  },

  listCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "700",
  },

  progressValue: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700",
  },

  progressBackground: {
    height: 9,
    backgroundColor: "#e2e8f0",
    borderRadius: 20,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 20,
  },

  emptyText: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 10,
  },
});