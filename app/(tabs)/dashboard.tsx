import { useRouter } from "expo-router";
import { BarChart3, ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ReportCard } from "../../components/cards/ReportCard";
import { ReportDetailModal } from "../../components/modals/ReportDetailModal";
import { StatusModal } from "../../components/modals/StatusModal";
import { FilterBar } from "../../components/navigation/FilterBar";
import { useGetAllReports } from "../../hooks/useGetAllReports";

export default function DashboardScreen() {
  const router = useRouter();

  const {
    reports,
    loading,
    refreshing,
    fetchReports,
    updateReportStatus,
  } = useGetAllReports();

  const [filter, setFilter] = useState("Tous");

  // Modales
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [tempStatus, setTempStatus] = useState("");

  const onUpdateStatus = async () => {
    if (!selectedReport) return;

    const success = await updateReportStatus(selectedReport.id, tempStatus);

    if (success) {
      setIsStatusModalVisible(false);
    }
  };

  const filteredReports =
    filter === "Tous"
      ? reports
      : reports.filter((r) => r.status === filter);

  return (
    <View style={styles.container}>
      {/* HEADER VISUEL */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          style={styles.backButton}
        >
          <ChevronLeft color="#023e8a" size={30} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Espace Intervenants</Text>
          <Text style={styles.subtitle}>{reports.length} signalements reçus</Text>
        </View>
      </View>


      {/* BOUTON STATISTIQUES */}
      <View style={styles.statsButtonWrapper}>
        <TouchableOpacity
          style={styles.statsButton}
          activeOpacity={0.85}
          onPress={() => router.push("../(tabs)/statistics")}
        >
          <BarChart3 color="#ffffff" size={22} />
          <Text style={styles.statsButtonText}>Voir les statistiques</Text>
        </TouchableOpacity>
      </View>

      {/* FILTRES SCROLLABLES vers la droite */}
      <FilterBar currentFilter={filter} onSelectFilter={setFilter} />

      {loading && !refreshing ? (
        <ActivityIndicator
          size="large"
          color="#023e8a"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchReports} />
          }
          renderItem={({ item }) => (
            <ReportCard
              item={item}
              onDetails={() => {
                setSelectedReport(item);
                setIsDetailsModalVisible(true);
              }}
              onStatus={() => {
                setSelectedReport(item);
                setTempStatus(item.status);
                setIsStatusModalVisible(true);
              }}
              onChat={() =>
                router.push({
                  pathname: `../chat/${item.id}`,
                  params: { role: "admin" },
                })
              }
            />
          )}
        />
      )}

      {/* MODALES EXTRAITES */}
      <StatusModal
        visible={isStatusModalVisible}
        currentStatus={tempStatus}
        onSelect={setTempStatus}
        onConfirm={onUpdateStatus}
        onCancel={() => setIsStatusModalVisible(false)}
      />

      <ReportDetailModal
        visible={isDetailsModalVisible}
        report={selectedReport}
        onClose={() => setIsDetailsModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
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

  statsButtonWrapper: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: "#f8fafc",
  },

  statsButton: {
    backgroundColor: "#023e8a",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    elevation: 3,
    shadowColor: "#023e8a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },

  statsButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});