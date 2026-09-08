import { useFocusEffect } from "@react-navigation/native";
import { BarChart3, MessageSquareText, Users } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from "react-native";

import { DashboardActionsCard } from "../../components/dashboard/DashboardActionsCard";
import { DashboardLinkCard } from "../../components/dashboard/DashboardLinkCard";
import { DashboardStatusGrid } from "../../components/dashboard/DashboardStatusGrid";
import { PageHeader } from "../../components/headers/PageHeader";
import { ScreenShell } from "../../components/layout/ScreenShell";
import { HeaderLogoutButton } from "../../components/navigation/HeaderLogoutButton";
import { HeaderThemeToggle } from "../../components/navigation/HeaderThemeToggle";
import { useAppTheme } from "../../contexts/ThemeContext";
import { useModerationPendingCount } from "../../hooks/community/useModerationPendingCount";
import { useDashboard } from "../../hooks/useDashboard";

export default function DashboardScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const dashboard = useDashboard();
  const moderationPending = useModerationPendingCount();

  useFocusEffect(
    useCallback(() => {
      void moderationPending.refresh();
    }, [moderationPending.refresh]),
  );

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
        left={<HeaderThemeToggle />}
        right={<HeaderLogoutButton />}
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
              onRefresh={() => {
                void dashboard.fetchReports();
                void moderationPending.refresh();
              }}
              tintColor={colors.primaryLight}
              colors={[colors.primaryLight]}
            />
          }
        >
          <DashboardStatusGrid
            cards={dashboard.statusCards}
            onSelect={openFilter}
          />

          <DashboardActionsCard>
            <DashboardLinkCard
              nested
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
              nested
              title="Modération de la Communauté"
              subtitle={
                moderationPending.pendingCount > 0
                  ? `${moderationPending.pendingCount} élément${
                      moderationPending.pendingCount > 1 ? "s" : ""
                    } en attente`
                  : "Surveiller et modérer le forum élèves"
              }
              icon={<Users size={22} color={colors.accent} strokeWidth={2.4} />}
              onPress={() => router.push("/(tabs)/moderation")}
              accessibilityLabel="Modération de la Communauté"
              badgeCount={moderationPending.pendingCount}
            />
            <DashboardLinkCard
              nested
              title="Statistiques"
              subtitle="Vue d’ensemble des signalements"
              icon={
                <BarChart3 size={22} color={colors.accent} strokeWidth={2.4} />
              }
              onPress={() => router.push("/(tabs)/statistics")}
              accessibilityLabel="Statistiques"
            />
          </DashboardActionsCard>
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
