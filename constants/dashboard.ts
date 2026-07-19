import { Platform } from "react-native";

export const DASHBOARD_HEADER = {
  MAX_HEIGHT: 140,
  MIN_HEIGHT: Platform.OS === "ios" ? 105 : 85,
} as const;

export const DASHBOARD_SCROLL_DISTANCE =
  DASHBOARD_HEADER.MAX_HEIGHT - DASHBOARD_HEADER.MIN_HEIGHT;

export const DASHBOARD_DEFAULT_FILTER = "Tous";

export const DASHBOARD_TITLE = "Espace Intervenants";
