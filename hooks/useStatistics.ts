import { useMemo } from "react";

import { isResolvedStatus } from "../constants/dashboard";
import { Report } from "../types/report";

type StatEntry = [string, number];

const MS_DAY = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function isOpenStatus(status: string) {
  return status === "Non traité" || status === "En cours";
}

export function useStatistics(reports: Report[]) {
  return useMemo(() => {
    const totalReports = reports.length;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * MS_DAY);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayStart = startOfDay(now);

    const nonTraiteCount = reports.filter(
      (report) => report.status === "Non traité",
    ).length;

    const enCoursCount = reports.filter(
      (report) => report.status === "En cours",
    ).length;

    const resoluCount = reports.filter((report) =>
      isResolvedStatus(report.status),
    ).length;

    const countByField = (fieldName: keyof Report): StatEntry[] => {
      const result: Record<string, number> = {};

      reports.forEach((report) => {
        const raw = report[fieldName];
        const value =
          raw === null || raw === undefined || raw === ""
            ? "Non renseigné"
            : String(raw);
        result[value] = (result[value] || 0) + 1;
      });

      return Object.entries(result).sort((a, b) => b[1] - a[1]);
    };

    const countByBoolean = (
      fieldName: "is_anonyme",
      trueLabel: string,
      falseLabel: string,
    ): StatEntry[] => {
      let yes = 0;
      let no = 0;
      reports.forEach((report) => {
        if (report[fieldName]) yes += 1;
        else no += 1;
      });
      return [
        [trueLabel, yes],
        [falseLabel, no],
      ];
    };

    const typesStats = countByField("type_harcelement");
    const urgencesStats = countByField("urgence");
    const lieuxStats = countByField("lieu");
    const frequencesStats = countByField("frequence");
    const victimesStats = countByField("nb_victimes");
    const anonymatStats = countByBoolean(
      "is_anonyme",
      "Anonymes",
      "Identifiés",
    );

    const thisWeekCount = reports.filter(
      (report) => new Date(report.created_at) >= weekAgo,
    ).length;

    const thisMonthCount = reports.filter(
      (report) => new Date(report.created_at) >= monthStart,
    ).length;

    const todayCount = reports.filter(
      (report) => new Date(report.created_at) >= dayStart,
    ).length;

    const openReports = reports.filter((report) => isOpenStatus(report.status));
    const avgOpenAgeDays =
      openReports.length === 0
        ? null
        : Math.round(
            (openReports.reduce((sum, report) => {
              const age = now.getTime() - new Date(report.created_at).getTime();
              return sum + age / MS_DAY;
            }, 0) /
              openReports.length) *
              10,
          ) / 10;

    const withAttachmentCount = reports.filter(
      (report) => typeof report.image_url === "string" && report.image_url.length > 0,
    ).length;

    const getPercentage = (value: number) => {
      if (totalReports === 0) return 0;
      return Math.round((value / totalReports) * 100);
    };

    return {
      totalReports,
      nonTraiteCount,
      enCoursCount,
      resoluCount,
      typesStats,
      urgencesStats,
      lieuxStats,
      frequencesStats,
      victimesStats,
      anonymatStats,
      thisWeekCount,
      thisMonthCount,
      todayCount,
      avgOpenAgeDays,
      openCount: openReports.length,
      withAttachmentCount,
      getPercentage,
    };
  }, [reports]);
}
