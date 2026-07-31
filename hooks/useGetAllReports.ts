import { useCallback, useEffect, useState } from "react";

import { supabase } from "../lib/supabase";
import { Report } from "../types/report";

type FetchReportsOptions = {
  /** Background update: no full-screen loader, no pull-to-refresh spinner. */
  silent?: boolean;
  /** User-initiated pull-to-refresh. */
  pullToRefresh?: boolean;
};

export const useGetAllReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = useCallback(async (options: FetchReportsOptions = {}) => {
    const { silent = false, pullToRefresh = false } = options;

    if (pullToRefresh) {
      setRefreshing(true);
    } else if (!silent) {
      setLoading(true);
    }

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setReports(data || []);
    }

    if (pullToRefresh) {
      setRefreshing(false);
    } else if (!silent) {
      setLoading(false);
    }
  }, []);

  const updateReportStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("reports")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
      );
      return true;
    }
    return false;
  };

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    loading,
    refreshing,
    fetchReports,
    updateReportStatus,
    setRefreshing,
  };
};
