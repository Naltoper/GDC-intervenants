import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";

import {
  DASHBOARD_DEFAULT_FILTER,
  DASHBOARD_REPORTS_POLL_MS,
  DASHBOARD_STATUS_CARDS,
  matchesDashboardFilter,
} from "../constants/dashboard";
import { Report } from "../types/report";
import { useGetAllReports } from "./useGetAllReports";

export const useDashboard = (initialFilter = DASHBOARD_DEFAULT_FILTER) => {
  const { reports, loading, refreshing, fetchReports, updateReportStatus } =
    useGetAllReports();

  const [filter, setFilter] = useState(initialFilter);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [tempStatus, setTempStatus] = useState("");

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Tous: reports.length,
      "Non traité": 0,
      "En cours": 0,
      Résolu: 0,
    };

    for (const report of reports) {
      if (report.status === "Non traité") counts["Non traité"] += 1;
      else if (report.status === "En cours") counts["En cours"] += 1;
      else if (matchesDashboardFilter(report.status, "Résolu")) {
        counts.Résolu += 1;
      }
    }

    return counts;
  }, [reports]);

  const statusCards = useMemo(
    () =>
      DASHBOARD_STATUS_CARDS.map((card) => ({
        ...card,
        count: statusCounts[card.key] ?? 0,
      })),
    [statusCounts],
  );

  const filteredReports = useMemo(
    () =>
      reports.filter((report) =>
        matchesDashboardFilter(report.status, filter),
      ),
    [filter, reports],
  );

  useFocusEffect(
    useCallback(() => {
      const intervalId = setInterval(() => {
        fetchReports({ silent: true });
      }, DASHBOARD_REPORTS_POLL_MS);

      return () => clearInterval(intervalId);
    }, [fetchReports]),
  );

  const openDetails = (report: Report) => {
    setSelectedReport(report);
    setIsDetailsModalVisible(true);
  };

  const openStatus = (report: Report) => {
    setSelectedReport(report);
    setTempStatus(report.status);
    setIsStatusModalVisible(true);
  };

  const closeDetails = () => setIsDetailsModalVisible(false);
  const closeStatus = () => setIsStatusModalVisible(false);

  const onUpdateStatus = async () => {
    if (!selectedReport) return;

    const success = await updateReportStatus(selectedReport.id, tempStatus);

    if (success) {
      setIsStatusModalVisible(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchReports({ pullToRefresh: true });
  }, [fetchReports]);

  return {
    reports,
    loading,
    refreshing,
    fetchReports: onRefresh,
    filter,
    setFilter,
    filteredReports,
    statusCards,
    selectedReport,
    tempStatus,
    setTempStatus,
    isStatusModalVisible,
    isDetailsModalVisible,
    openDetails,
    openStatus,
    closeDetails,
    closeStatus,
    onUpdateStatus,
  };
};
