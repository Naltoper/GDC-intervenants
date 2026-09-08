import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from "react-native";

import { ChatHistoryButton } from "../../components/dashboard/ChatHistoryButton";
import { DashboardPageTitle } from "../../components/dashboard/DashboardPageTitle";
import { DashboardStatusGrid } from "../../components/dashboard/DashboardStatusGrid";
import { PageHeader } from "../../components/headers/PageHeader";
import { ScreenShell } from "../../components/layout/ScreenShell";
import { HeaderOverflowMenu } from "../../components/navigation/HeaderOverflowMenu";
import { useAppTheme } from "../../contexts/ThemeContext";
import { useDashboard } from "../../hooks/useDashboard";

export default function DashboardScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const dashboard = useDashboard();

  const openFilter = (filterKey: string) => {
    router.push({
      pathname: "/(tabs)/reports",
      params: { filter: filterKey },
    });
  };

  return (
    <ScreenShell>
      <PageHeader
        title="Espace Intervenants"
        subtitle="Gestion des signalements"
        right={<HeaderOverflowMenu />}
      />

      {dashboard.loading && !dashboard.refreshing ? (
        <ActivityIndicator
          size="large"
          color={colors.primaryLight}
          style={styles.loader}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={dashboard.refreshing}
              onRefresh={dashboard.fetchReports}
              tintColor={colors.primaryLight}
              colors={[colors.primaryLight]}
            />
          }
        >
          <DashboardPageTitle reportCount={dashboard.reports.length} />
          <DashboardStatusGrid
            cards={dashboard.statusCards}
            onSelect={openFilter}
          />
          <ChatHistoryButton
            onPress={() => router.push("/(tabs)/chat-history")}
          />
        </ScrollView>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 12,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  loader: {
    marginTop: 48,
  },
});
