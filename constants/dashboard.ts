import { Platform } from "react-native";

import { APP_COLORS, Colors } from "./theme";

export const DASHBOARD_HEADER = {
  /** Compact sticky bar height (safe area already handled by root layout). */
  STICKY_HEIGHT: Platform.OS === "ios" ? 56 : 52,
  /** Scroll offset after which the sticky title/bar fully appear. */
  SHOW_AFTER: 48,
} as const;

/** Silent background refresh interval for the dashboard reports list. */
export const DASHBOARD_REPORTS_POLL_MS = 30_000;

export const DASHBOARD_DEFAULT_FILTER = "Tous";

export const DASHBOARD_TITLE = "Espace Intervenants";

export type DashboardFilterKey =
  | "Tous"
  | "Non traité"
  | "En cours"
  | "Résolu";

export type DashboardStatusCardConfig = {
  key: DashboardFilterKey;
  label: string;
  accent: string;
  background: string;
  text: string;
};

export const DASHBOARD_STATUS_CARDS: DashboardStatusCardConfig[] = [
  {
    key: "Tous",
    label: "Tous",
    accent: APP_COLORS.primary,
    background: "#E8F4FD",
    text: Colors.light.primary,
  },
  {
    key: "Non traité",
    label: "Non traités",
    accent: Colors.light.status.error,
    background: Colors.light.status.errorBg,
    text: Colors.light.status.errorText,
  },
  {
    key: "En cours",
    label: "En cours",
    accent: Colors.light.status.warning,
    background: Colors.light.status.warningBg,
    text: Colors.light.status.warningText,
  },
  {
    key: "Résolu",
    label: "Résolus",
    accent: Colors.light.status.success,
    background: Colors.light.status.successBg,
    text: Colors.light.status.successText,
  },
];

export const isResolvedStatus = (status: string) =>
  status === "Résolu" || status === "Traité";

export const matchesDashboardFilter = (
  status: string,
  filter: string,
): boolean => {
  if (filter === DASHBOARD_DEFAULT_FILTER || filter === "Tous") return true;
  if (filter === "Résolu") return isResolvedStatus(status);
  return status === filter;
};
