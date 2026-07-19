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
import { DashboardStatsButton } from "./DashboardStatsButton";

interface DashboardReportListProps {
  reports: Report[];
  loading: boolean;
  refreshing: boolean;
  filter: string;
  scrollHandler: ReturnType<typeof useCollapsingHeader>["scrollHandler"];
  onRefresh: () => void;
  onFilterChange: (filter: string) => void;
  onStatsPress: () => void;
  onDetails: (report: Report) => void;
  onStatus: (report: Report) => void;
  onChat: (report: Report) => void;
}

export const DashboardReportList = ({
  reports,
  loading,
  refreshing,
  filter,
  scrollHandler,
  onRefresh,
  onFilterChange,
  onStatsPress,
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
      keyExtractor={(item) => item.id.toString()}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          <DashboardStatsButton onPress={onStatsPress} />
          <FilterBar currentFilter={filter} onSelectFilter={onFilterChange} />
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          progressViewOffset={DASHBOARD_HEADER.MAX_HEIGHT}
        />
      }
      renderItem={({ item, index }) => (
        <ReportCard
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
    marginTop: DASHBOARD_HEADER.MAX_HEIGHT + 50,
  },
  listContent: {
    paddingTop: DASHBOARD_HEADER.MAX_HEIGHT + 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  listHeader: {
    marginBottom: 15,
  },
});
