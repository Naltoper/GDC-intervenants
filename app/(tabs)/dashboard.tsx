import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient"; // 🟢 Ajouté pour le bouton stats
import { useRouter } from "expo-router";
import { BarChart3, ChevronLeft } from "lucide-react-native"; // 🟢 Ajouté BarChart3
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
import { Colors, APP_COLORS } from "../../constants/theme"; // 🟢 On garde les deux imports de thèmes
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

    if (success) {
      setIsStatusModalVisible(false);
    }
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
        {Platform.OS === 'android' ? (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#ffffff09' }]} />
        ) : (
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        )}
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
            <View style={{ marginBottom: 15 }}>
              
              {/* 🟢 LE BOUTON STATISTIQUES DE TON COLLÈGUE INJECTÉ ICI */}
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/statistics")}
                activeOpacity={0.85}
                style={styles.statsButtonWrapper}
              >
                <LinearGradient
                  colors={[APP_COLORS.gradient.start, APP_COLORS.gradient.end]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statsButton}
                >
                  <BarChart3 color={APP_COLORS.white} size={22} />
                  <Text style={styles.statsButtonText}>Voir les statistiques</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Ta barre de filtres d'origine */}
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
  // Blanc opaque sur Android, semi-transparent pour laisser le flou agir sur iOS et Web
  backgroundColor: Platform.OS === 'android' ? "#fffffff6" : "rgba(255, 255, 255, 0.6)",
  borderBottomWidth: 1,
  borderBottomColor: Colors.light.borderSubtle,
  overflow: "hidden",
  // Élévation pour Android uniquement
  ...Platform.select({
    android: {
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
    }
  }),
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
  // 🟢 Styles requis pour le bouton statistiques
  statsButtonWrapper: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 10,
  },
  statsButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    elevation: 5,
  },
  statsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});