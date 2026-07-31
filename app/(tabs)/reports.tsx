import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";

import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { DashboardReportList } from "../../components/dashboard/DashboardReportList";
import { ReportDetailModal } from "../../components/modals/ReportDetailModal";
import { StatusModal } from "../../components/modals/StatusModal";
import {
  DASHBOARD_DEFAULT_FILTER,
  DASHBOARD_STATUS_CARDS,
} from "../../constants/dashboard";
import { useCollapsingHeader } from "../../hooks/useCollapsingHeader";
import { useDashboard } from "../../hooks/useDashboard";

export default function ReportsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: string | string[] }>();
  const filterParam = Array.isArray(params.filter)
    ? params.filter[0]
    : params.filter;
  const initialFilter = filterParam || DASHBOARD_DEFAULT_FILTER;

  const dashboard = useDashboard(initialFilter);
  const { scrollHandler, stickyBarStyle, stickyTitleStyle } =
    useCollapsingHeader();

  useEffect(() => {
    if (filterParam) {
      dashboard.setFilter(filterParam);
    }
    // Sync URL filter into local state when navigating from status cards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterParam]);

  const stickyLabel =
    DASHBOARD_STATUS_CARDS.find((card) => card.key === dashboard.filter)
      ?.label ?? dashboard.filter;

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/lyceeBgBlur.png")}
        style={styles.screenBackground}
        imageStyle={styles.screenBackgroundImage}
        resizeMode="cover"
      >
        <DashboardHeader
          onBack={() => router.replace("/(tabs)/dashboard")}
          stickyBarStyle={stickyBarStyle}
          stickyTitleStyle={stickyTitleStyle}
          stickyTitle={stickyLabel}
        />

        <DashboardReportList
          reports={dashboard.filteredReports}
          reportCount={dashboard.filteredReports.length}
          loading={dashboard.loading}
          refreshing={dashboard.refreshing}
          filter={dashboard.filter}
          title={stickyLabel}
          scrollHandler={scrollHandler}
          onRefresh={dashboard.fetchReports}
          onFilterChange={(nextFilter) => {
            dashboard.setFilter(nextFilter);
            router.setParams({ filter: nextFilter });
          }}
          onDetails={dashboard.openDetails}
          onStatus={dashboard.openStatus}
          onChat={(item) =>
            router.push({
              pathname: "/chat/[id]",
              params: { id: item.id, role: "admin" },
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
