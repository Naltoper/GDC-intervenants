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
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";


import { StatCard } from "../../components/statistics/statCard";
import { StatisticsSection } from "../../components/statistics/StatisticsSection";
import { APP_COLORS } from "../../constants/theme";
import { useGetAllReports } from "../../hooks/useGetAllReports";
import { useStatistics } from "../../hooks/useStatistics";
const STATISTICS_COLOR = '#023e8a';


export default function StatisticsScreen() {
  const router = useRouter();

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
        <ImageBackground
              source={require('../../assets/images/lyceeBgBlur.png')}
              style={styles.screenBackground}
              imageStyle={styles.screenBackgroundImage}
              resizeMode="cover"
        >
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

          <StatisticsSection
            title="Répartition par type"
            data={typesStats}
            color={APP_COLORS.primary}
            getPercentage={getPercentage}
          />

          <Text style={styles.sectionTitle}>
            Niveaux d&apos;urgence
          </Text>

        <StatisticsSection
          title="Répartition par urgence"
          data={urgencesStats}
          color={APP_COLORS.status.danger}
          getPercentage={getPercentage}
        />  
        </ScrollView>
        </ImageBackground>
      </View>
    </>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#b6d9ff",
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
  screenBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  screenBackgroundImage: {
    opacity: 0.5, 
  },
});