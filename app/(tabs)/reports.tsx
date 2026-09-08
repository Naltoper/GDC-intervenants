import { useLocalSearchParams, useRouter } from "expo-router";
import { Filter, FolderOpen } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ReportCard } from "../../components/cards/ReportCard";
import { PageHeader } from "../../components/headers/PageHeader";
import { ScreenShell } from "../../components/layout/ScreenShell";
import { ReportDetailModal } from "../../components/modals/ReportDetailModal";
import { StatusModal } from "../../components/modals/StatusModal";
import {
  matchesStatusFilter,
  SuivisFilterBar,
  type SuivisDateSort,
  type SuivisStatusFilter,
} from "../../components/suivis/SuivisFilterBar";
import {
  DASHBOARD_DEFAULT_FILTER,
  DASHBOARD_STATUS_CARDS,
} from "../../constants/dashboard";
import { useAppTheme } from "../../contexts/ThemeContext";
import { useDashboard } from "../../hooks/useDashboard";
import { usePullToRefresh } from "../../hooks/usePullToRefresh";
import { useReportsWithChat } from "../../hooks/useReportsWithChat";

function parseFilterParam(
  value: string | string[] | undefined,
): SuivisStatusFilter {
  const raw = Array.isArray(value) ? value[0] : value;
  if (
    raw === "Non traité" ||
    raw === "En cours" ||
    raw === "Résolu" ||
    raw === "Tous"
  ) {
    return raw;
  }
  return DASHBOARD_DEFAULT_FILTER as SuivisStatusFilter;
}

export default function ReportsScreen() {
  const router = useRouter();
  const { colors, surface, headerFg } = useAppTheme();
  const params = useLocalSearchParams<{ filter?: string | string[] }>();
  const routeFilter = parseFilterParam(params.filter);
  const allowFilters = routeFilter === "Tous";

  const dashboard = useDashboard(routeFilter);
  const { reportIdsWithChat, refresh: refreshChatIds } = useReportsWithChat();

  const [statusFilter, setStatusFilter] =
    useState<SuivisStatusFilter>(routeFilter);
  const [onlyWithChat, setOnlyWithChat] = useState(false);
  const [dateSort, setDateSort] = useState<SuivisDateSort>("recent");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setStatusFilter(routeFilter);
    dashboard.setFilter(routeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeFilter]);

  const filtersActive =
    allowFilters &&
    (statusFilter !== "Tous" || onlyWithChat || dateSort !== "recent");

  const displayedReports = useMemo(() => {
    const toTimestamp = (value: string | null | undefined) => {
      const time = value ? new Date(value).getTime() : Number.NaN;
      return Number.isFinite(time) ? time : 0;
    };

    const source = allowFilters ? dashboard.reports : dashboard.filteredReports;

    const visible = source.filter((report) => {
      if (!matchesStatusFilter(report.status, statusFilter)) return false;
      if (onlyWithChat && !reportIdsWithChat.has(report.id)) return false;
      return true;
    });

    return [...visible].sort((a, b) => {
      const timeA = toTimestamp(a.created_at);
      const timeB = toTimestamp(b.created_at);
      return dateSort === "oldest" ? timeA - timeB : timeB - timeA;
    });
  }, [
    allowFilters,
    dashboard.reports,
    dashboard.filteredReports,
    statusFilter,
    onlyWithChat,
    dateSort,
    reportIdsWithChat,
  ]);

  const stickyLabel =
    DASHBOARD_STATUS_CARDS.find((card) => card.key === statusFilter)?.label ??
    statusFilter;

  const emptyBecauseFilter =
    (allowFilters ? dashboard.reports.length : dashboard.filteredReports.length) >
      0 && displayedReports.length === 0;

  const onRefresh = async () => {
    await dashboard.fetchReports();
    await refreshChatIds();
  };

  const pullRefresh = usePullToRefresh({
    refreshing: dashboard.refreshing,
    onRefresh,
    tintColor: colors.primaryLight,
  });

  return (
    <ScreenShell>
      <PageHeader
        title={stickyLabel}
        subtitle={
          allowFilters
            ? "Tous les signalements"
            : `${displayedReports.length} signalement${
                displayedReports.length === 1 ? "" : "s"
              }`
        }
        onBack={() => router.replace("/(tabs)/dashboard")}
        right={
          allowFilters ? (
            <TouchableOpacity
              onPress={() => setFiltersOpen((open) => !open)}
              style={[
                styles.filterButton,
                filtersOpen && styles.filterButtonActive,
              ]}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={
                filtersOpen ? "Masquer les filtres" : "Afficher les filtres"
              }
            >
              <Filter
                color={filtersOpen || filtersActive ? colors.accent : headerFg}
                size={20}
                strokeWidth={2.3}
              />
              {filtersActive ? <View style={styles.filterDot} /> : null}
            </TouchableOpacity>
          ) : undefined
        }
      />

      {allowFilters && filtersOpen ? (
        <SuivisFilterBar
          status={statusFilter}
          onStatusChange={(next) => {
            setStatusFilter(next);
            dashboard.setFilter(next);
          }}
          onlyWithChat={onlyWithChat}
          onOnlyWithChatChange={setOnlyWithChat}
          dateSort={dateSort}
          onDateSortChange={setDateSort}
        />
      ) : null}

      {dashboard.loading && !dashboard.refreshing ? (
        <ActivityIndicator
          size="large"
          color={colors.primaryLight}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={displayedReports}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            displayedReports.length === 0 && styles.listContentEmpty,
          ]}
          {...pullRefresh}
          ListEmptyComponent={
            <View style={styles.emptyWrapper}>
              <View
                style={[
                  styles.emptyCard,
                  { backgroundColor: surface, borderColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.emptyIcon,
                    {
                      backgroundColor: colors.borderSubtle,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <FolderOpen
                    color={colors.textMuted}
                    size={38}
                    strokeWidth={1.5}
                  />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.accent }]}>
                  {emptyBecauseFilter
                    ? "Aucun signalement pour ce filtre"
                    : "Aucun signalement"}
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                  {emptyBecauseFilter
                    ? "Essayez un autre statut, une autre date, ou désactivez le filtre « Chat actif »."
                    : "Les signalements reçus apparaîtront ici."}
                </Text>
              </View>
            </View>
          }
          renderItem={({ item, index }) => (
            <ReportCard
              item={item}
              index={index}
              onDetails={() => dashboard.openDetails(item)}
              onStatus={() => dashboard.openStatus(item)}
              onChat={() =>
                router.push({
                  pathname: "/chat/[id]",
                  params: {
                    id: item.id,
                    role: "admin",
                    from: "reports",
                    filter: statusFilter,
                  },
                })
              }
            />
          )}
        />
      )}

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
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.42)",
  },
  filterButtonActive: {
    backgroundColor: "rgba(2, 62, 138, 0.12)",
  },
  filterDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
  },
  loader: {
    marginTop: 48,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyWrapper: {
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 24,
  },
  emptyCard: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 32,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
  },
  emptyTitle: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
  },
});
