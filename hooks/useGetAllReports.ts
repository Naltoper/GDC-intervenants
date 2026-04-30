import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Report } from '../types/report';

export const useGetAllReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error) {
      setReports(data || []);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const updateReportStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("reports")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      // On met à jour l'état local pour que l'interface change instantanément
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      return true;
    }
    return false;
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    loading,
    refreshing,
    fetchReports,
    updateReportStatus,
    setRefreshing
  };
};