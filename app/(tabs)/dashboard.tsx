import { useRouter } from "expo-router";
import { ImageBackground, StyleSheet, View } from "react-native";

import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { DashboardReportList } from "../../components/dashboard/DashboardReportList";
import { ReportDetailModal } from "../../components/modals/ReportDetailModal";
import { StatusModal } from "../../components/modals/StatusModal";
import { useCollapsingHeader } from "../../hooks/useCollapsingHeader";
import { useDashboard } from "../../hooks/useDashboard";

export default function DashboardScreen() {
  const router = useRouter();
  const dashboard = useDashboard();
  const {
    scrollHandler,
    headerAnimatedStyle,
    largeTitleStyle,
    smallTitleStyle,
  } = useCollapsingHeader();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/lyceeBgBlur.png")}
        style={styles.screenBackground}
        imageStyle={styles.screenBackgroundImage}
        resizeMode="cover"
      >
        <DashboardHeader
          reportCount={dashboard.reports.length}
          onBack={() => router.replace("/(tabs)")}
          headerAnimatedStyle={headerAnimatedStyle}
          largeTitleStyle={largeTitleStyle}
          smallTitleStyle={smallTitleStyle}
        />

        <DashboardReportList
          reports={dashboard.filteredReports}
          loading={dashboard.loading}
          refreshing={dashboard.refreshing}
          filter={dashboard.filter}
          scrollHandler={scrollHandler}
          onRefresh={dashboard.fetchReports}
          onFilterChange={dashboard.setFilter}
          onStatsPress={() => router.push("/(tabs)/statistics")}
          onDetails={dashboard.openDetails}
          onStatus={dashboard.openStatus}
          onChat={(item) =>
            router.push({
              pathname: `../chat/${item.id}`,
              params: { role: "admin" },
            })
          }
        />

        <StatusModal
          visible={dashboard.isStatusModalVisible}
          currentStatus={dashboard.tempStatus}
          onSelect={dashboard.setTempStatus}
          onConfirm={dashboard.onUpdateStatus}
          onCancel={dashboard.closeStatus}
        />
        <ReportDetailModal
          visible={dashboard.isDetailsModalVisible}
          report={dashboard.selectedReport}
          onClose={dashboard.closeDetails}
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#b6d9ff",
  },
  screenBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  screenBackgroundImage: {
    opacity: 0.5,
  },
});
