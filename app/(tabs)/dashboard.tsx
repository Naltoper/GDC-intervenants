import { MessageSquareText, Users } from "lucide-react-native";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from "react-native";

import { DashboardLinkCard } from "../../components/dashboard/DashboardLinkCard";
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
          <DashboardStatusGrid
            cards={dashboard.statusCards}
            onSelect={openFilter}
          />
          <DashboardLinkCard
            title="Historique des chats"
            subtitle="Conversations avec les élèves"
            icon={
              <MessageSquareText
                size={22}
                color={colors.accent}
                strokeWidth={2.4}
              />
            }
            onPress={() => router.push("/(tabs)/chat-history")}
          />
          <DashboardLinkCard
            title="Modération de la Communauté"
            subtitle="Surveiller et modérer le forum élèves"
            icon={<Users size={22} color={colors.accent} strokeWidth={2.4} />}
            onPress={() => router.push("/(tabs)/moderation")}
            accessibilityLabel="Modération de la Communauté"
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
