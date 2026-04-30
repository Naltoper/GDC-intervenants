import { useRouter } from "expo-router";
import {ChevronLeft,Info,MessageCircle,Shield,User} from "lucide-react-native";
import { useEffect, useState } from "react";
import {ActivityIndicator,FlatList,RefreshControl,
  ScrollView,StyleSheet,Text,TouchableOpacity,View} from "react-native";
import { supabase } from "../../lib/supabase";

import { ReportDetailModal } from "../../components/modals/ReportDetailModal";
import { StatusModal } from "../../components/modals/StatusModal";
import { ReportCard } from "../../components/cards/ReportCard";


export default function DashboardScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("Tous");

  // Modales
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [tempStatus, setTempStatus] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setReports(data || []);
    setLoading(false);
  };

  const onUpdateStatus = async () => {
    if (!selectedReport) return;
    const { error } = await supabase
      .from("reports")
      .update({ status: tempStatus })
      .eq("id", selectedReport.id);
    if (!error) {
      setReports(
        reports.map((r) =>
          r.id === selectedReport.id ? { ...r, status: tempStatus } : r,
        ),
      );
      setIsStatusModalVisible(false);
    }
  };

  const filteredReports =
    filter === "Tous" ? reports : reports.filter((r) => r.status === filter);

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
          <Text style={styles.subtitle}>
            {reports.length} signalements reçus
          </Text>
        </View>
      </View>

      {/* FILTRES SCROLLABLES */}
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

// --- SOUS-COMPOSANTS DE REFACTORING ---

const FilterBar = ({ currentFilter, onSelectFilter }: any) => (
  <View style={styles.filterBar}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterScroll}
    >
      {["Tous", "Non traité", "En cours", "Résolu"].map((f) => (
        <TouchableOpacity
          key={f}
          onPress={() => onSelectFilter(f)}
          style={[
            styles.filterBadge,
            currentFilter === f && styles.filterBadgeActive,
          ]}
        >
          <Text
            style={[
              styles.filterText,
              currentFilter === f && styles.filterTextActive,
            ]}
          >
            {f}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

// --- STYLES (Conservés et nettoyés) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
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
  backButton: { position: "absolute", left: 15, top: 45, padding: 10 },
  titleWrapper: { alignItems: "center" },
  title: { fontSize: 22, fontWeight: "800", color: "#023e8a" },
  subtitle: { fontSize: 12, color: "#64748b" },
  filterBar: { backgroundColor: "#fff", paddingVertical: 10 },
  filterScroll: { paddingHorizontal: 20, gap: 10 },
  filterBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  filterBadgeActive: { backgroundColor: "#023e8a" },
  filterText: { fontWeight: "700", color: "#64748b" },
  filterTextActive: { color: "#fff" },
});
