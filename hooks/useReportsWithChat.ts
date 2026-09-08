import { useCallback, useEffect, useState } from 'react';

import { supabase } from '../lib/supabase';

/** IDs de signalements ayant au moins un message (filtre « Chat actif »). */
export function useReportsWithChat() {
  const [reportIdsWithChat, setReportIdsWithChat] = useState<Set<string>>(
    () => new Set(),
  );

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('report_id');

    if (error || !data) {
      setReportIdsWithChat(new Set());
      return;
    }

    const ids = new Set<string>();
    for (const row of data) {
      if (row.report_id) ids.add(String(row.report_id));
    }
    setReportIdsWithChat(ids);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { reportIdsWithChat, refresh };
}
