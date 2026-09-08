import { useCallback, useEffect, useState } from "react";

import { supabase } from "../lib/supabase";
import { Report } from "../types/report";
import { decodeChatContent } from "../utils/chatMessage";

export type ChatHistoryItem = {
  report: Report;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
};

export const useChatHistory = () => {
  const [items, setItems] = useState<ChatHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async (pullToRefresh = false) => {
    if (pullToRefresh) setRefreshing(true);
    else setLoading(true);

    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("report_id, content, created_at")
      .order("created_at", { ascending: false });

    if (messagesError || !messages?.length) {
      setItems([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const byReport = new Map<
      string,
      { lastMessage: string; lastMessageAt: string; messageCount: number }
    >();

    for (const message of messages) {
      const reportId = message.report_id as string;
      const existing = byReport.get(reportId);
      if (!existing) {
        const decoded = decodeChatContent(message.content ?? "");
        const preview =
          decoded.text.trim() ||
          (decoded.imageUrl ? "📷 Image" : "Conversation ouverte");
        byReport.set(reportId, {
          lastMessage: preview,
          lastMessageAt: message.created_at,
          messageCount: 1,
        });
      } else {
        existing.messageCount += 1;
      }
    }

    const reportIds = Array.from(byReport.keys());
    const { data: reports, error: reportsError } = await supabase
      .from("reports")
      .select("*")
      .in("id", reportIds)
      .order("created_at", { ascending: false });

    if (reportsError || !reports) {
      setItems([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const history = reports
      .map((report) => {
        const meta = byReport.get(report.id);
        if (!meta) return null;
        return {
          report: report as Report,
          lastMessage: meta.lastMessage,
          lastMessageAt: meta.lastMessageAt,
          messageCount: meta.messageCount,
        };
      })
      .filter(Boolean) as ChatHistoryItem[];

    history.sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime(),
    );

    setItems(history);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    items,
    loading,
    refreshing,
    refresh: () => fetchHistory(true),
  };
};
