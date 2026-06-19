import { Report } from "../types/report";

type StatEntry = [string, number];

export function useStatistics(reports: Report[]) {
  const totalReports = reports.length;

  const nonTraiteCount = reports.filter(
    (report) => report.status === "Non traité"
  ).length;

  const enCoursCount = reports.filter(
    (report) => report.status === "En cours"
  ).length;

  const resoluCount = reports.filter(
    (report) => report.status === "Résolu"
  ).length;

  const countByField = (fieldName: keyof Report): StatEntry[] => {
    const result: Record<string, number> = {};

    reports.forEach((report) => {
      const value = report[fieldName] || "Non renseigné";
      result[String(value)] = (result[String(value)] || 0) + 1;
    });

    return Object.entries(result);
  };

  const typesStats = countByField("type_harcelement");
  const urgencesStats = countByField("urgence");

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
    getPercentage,
  };
}