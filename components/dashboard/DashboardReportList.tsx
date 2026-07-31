import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import Animated from "react-native-reanimated";

import { DASHBOARD_HEADER } from "../../constants/dashboard";
import { Colors } from "../../constants/theme";
import { useCollapsingHeader } from "../../hooks/useCollapsingHeader";
import { Report } from "../../types/report";
import { ReportCard } from "../cards/ReportCard";
import { FilterBar } from "../navigation/FilterBar";
import { DashboardPageTitle } from "./DashboardPageTitle";

interface DashboardReportListProps {
  reports: Report[];
  reportCount: number;
  loading: boolean;
  refreshing: boolean;
  filter: string;
  title?: string;
  scrollHandler: ReturnType<typeof useCollapsingHeader>["scrollHandler"];
  onRefresh: () => void;
  onFilterChange: (filter: string) => void;
  onDetails: (report: Report) => void;
  onStatus: (report: Report) => void;
  onChat: (report: Report) => void;
}

export const DashboardReportList = ({
  reports,
  reportCount,
  loading,
  refreshing,
  filter,
  title,
  scrollHandler,
  onRefresh,
  onFilterChange,
  onDetails,
  onStatus,
  onChat,
}: DashboardReportListProps) => {
  if (loading && !refreshing) {
    return (
      <ActivityIndicator
        size="large"
        color={Colors.light.primary}
        style={styles.loader}
      />
    );
  }

  return (
    <Animated.FlatList
      data={reports}
      keyExtractor={(item) => `${filter}_${item.id}`}
      extraData={filter}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          <DashboardPageTitle reportCount={reportCount} title={title} />
          <FilterBar currentFilter={filter} onSelectFilter={onFilterChange} />
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          progressViewOffset={DASHBOARD_HEADER.STICKY_HEIGHT}
        />
      }
      renderItem={({ item, index }) => (
        <ReportCard
          key={`${filter}_${item.id}`}
          item={item}
          index={index}
          onDetails={() => onDetails(item)}
          onStatus={() => onStatus(item)}
          onChat={() => onChat(item)}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  loader: {
    marginTop: DASHBOARD_HEADER.STICKY_HEIGHT + 40,
  },
  listContent: {
    paddingTop: DASHBOARD_HEADER.STICKY_HEIGHT + 8,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  listHeader: {
    marginBottom: 15,
  },
});
