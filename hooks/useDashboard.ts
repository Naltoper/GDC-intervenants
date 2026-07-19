import { useMemo, useState } from "react";

import { DASHBOARD_DEFAULT_FILTER } from "../constants/dashboard";
import { Report } from "../types/report";
import { useGetAllReports } from "./useGetAllReports";

export const useDashboard = () => {
  const { reports, loading, refreshing, fetchReports, updateReportStatus } =
    useGetAllReports();

  const [filter, setFilter] = useState(DASHBOARD_DEFAULT_FILTER);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [tempStatus, setTempStatus] = useState("");

  const filteredReports = useMemo(
    () =>
      filter === DASHBOARD_DEFAULT_FILTER
        ? reports
        : reports.filter((report) => report.status === filter),
    [filter, reports],
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

  return {
    reports,
    loading,
    refreshing,
    fetchReports,
    filter,
    setFilter,
    filteredReports,
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
