import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { ReportCard } from "../../components/cards/ReportCard";
import { ReportDetailModal } from "../../components/modals/ReportDetailModal";
import { StatusModal } from "../../components/modals/StatusModal";
import { FilterBar } from "../../components/navigation/FilterBar";
import { Colors } from "../../constants/theme"; // Importation du thème
import { useGetAllReports } from "../../hooks/useGetAllReports";

const HEADER_MAX_HEIGHT = 140;
const HEADER_MIN_HEIGHT = Platform.OS === "ios" ? 105 : 85;
const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function DashboardScreen() {
  const router = useRouter();
  const { reports, loading, refreshing, fetchReports, updateReportStatus } =
    useGetAllReports();

  const [filter, setFilter] = useState("Tous");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [tempStatus, setTempStatus] = useState("");

  const onUpdateStatus = async () => {
    if (!selectedReport) return;
    const success = await updateReportStatus(selectedReport.id, tempStatus);
    if (success) setIsStatusModalVisible(false);
  };

  const filteredReports =
    filter === "Tous" ? reports : reports.filter((r) => r.status === filter);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolation.CLAMP,
    );
    return { height };
  });

  const largeTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE / 2],
      [1, 0],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [0, -15],
      Extrapolation.CLAMP,
    );
    return { opacity, transform: [{ translateY }] };
  });

  const smallTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_DISTANCE / 2, SCROLL_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            style={styles.backButton}
          >
            <ChevronLeft
              color={Colors.light.primary}
              size={30}
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          <Animated.View style={[styles.smallTitleWrapper, smallTitleStyle]}>
            <Text style={styles.smallTitle}>Espace Intervenants</Text>
          </Animated.View>

          <Animated.View style={[styles.titleWrapper, largeTitleStyle]}>
            <Text style={styles.title}>Espace Intervenants</Text>
            <Text style={styles.subtitle}>
              {reports.length} signalements reçus
            </Text>
          </Animated.View>
        </View>
      </Animated.View>

      {loading && !refreshing ? (
        <ActivityIndicator
          size="large"
          color={Colors.light.primary}
          style={{ marginTop: HEADER_MAX_HEIGHT + 50 }}
        />
      ) : (
        <Animated.FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id.toString()}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingTop: HEADER_MAX_HEIGHT + 10,
            paddingBottom: 20,
            paddingHorizontal: 20,
          }}
          ListHeaderComponent={
            <View style={{ marginBottom: 15, marginHorizontal: -20 }}>
              <FilterBar currentFilter={filter} onSelectFilter={setFilter} />
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchReports}
              progressViewOffset={HEADER_MAX_HEIGHT}
            />
          }
          renderItem={({ item, index }) => (
            <ReportCard
              item={item}
              index={index}
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

      {/* Modales */}
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
    backgroundColor: Colors.light.background, // Utilisation du thème
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    // On utilise Colors.light.surface avec une opacité pour le header
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderSubtle, // Utilisation de la nouvelle variable
    overflow: "hidden",
  },
  headerContent: { flex: 1, justifyContent: "flex-end", paddingBottom: 15 },
  backButton: {
    position: "absolute",
    left: 15,
    bottom: 15,
    padding: 10,
    zIndex: 20,
  },
  titleWrapper: {
    alignItems: "center",
    position: "absolute",
    bottom: 15,
    width: "100%",
  },
  title: { fontSize: 22, fontWeight: "800", color: Colors.light.primary },
  subtitle: { fontSize: 12, color: Colors.light.textMuted },
  smallTitleWrapper: {
    position: "absolute",
    bottom: 25,
    width: "100%",
    alignItems: "center",
  },
  smallTitle: { fontSize: 16, fontWeight: "700", color: Colors.light.primary },
});
