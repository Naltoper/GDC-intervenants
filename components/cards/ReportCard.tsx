import { FileText, MessageCircle, Shield, SquarePen, User } from "lucide-react-native";
import React, { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import type { AppColorPalette } from "../../constants/theme";
import { useAppTheme } from "../../contexts/ThemeContext";
import { Report } from "../../types/report";
import { GradientButton } from "../buttons/GradientButton";

export function getStatusColors(
  colors: AppColorPalette,
): Record<string, { bg: string; dot: string; text: string }> {
  return {
    "En cours": {
      bg: colors.status.warningBg,
      dot: colors.status.warning,
      text: colors.status.warningText,
    },
    Résolu: {
      bg: colors.status.successBg,
      dot: colors.status.success,
      text: colors.status.successText,
    },
    "Non traité": {
      bg: colors.status.errorBg,
      dot: colors.status.error,
      text: colors.status.errorText,
    },
  };
}

interface ReportCardProps {
  item: Report;
  index?: number;
  onDetails: () => void;
  onStatus: () => void;
  onChat: () => void;
}

const formatReportDate = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const ReportCard = ({
  item,
  index = 0,
  onDetails,
  onStatus,
  onChat,
}: ReportCardProps) => {
  const { colors, surface } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, surface), [colors, surface]);
  const statusMap = useMemo(() => getStatusColors(colors), [colors]);
  const status = statusMap[item.status || ""] || statusMap["Non traité"];
  const reportDate = formatReportDate(item.created_at);

  const { width } = useWindowDimensions();
  const isCompact = width < 400;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100)
        .springify()
        .damping(30)
        .mass(1.5)}
      style={[
        styles.card,
        isCompact && styles.cardCompact,
        { borderLeftColor: status.dot },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.authorBlock}>
          <View
            style={[
              styles.avatar,
              item.is_anonyme ? styles.avatarAnonymous : styles.avatarNamed,
            ]}
          >
            {item.is_anonyme ? (
              <Shield size={18} color={colors.textMuted} />
            ) : (
              <User size={18} color={colors.accent} />
            )}
          </View>
          <Text
            style={[
              styles.authorName,
              {
                color: item.is_anonyme ? colors.textMuted : colors.accent,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.is_anonyme ? " Anonyme" : ` ${item.author_name}`}
          </Text>
        </View>

        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onDetails();
          }}
          style={({ pressed }) => [
            styles.detailsButton,
            pressed && styles.detailsButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Voir les détails"
        >
          <FileText size={16} color={colors.accent} />
          <Text style={[styles.detailsButtonText, { color: colors.accent }]}>
            Détails
          </Text>
        </Pressable>
      </View>

      <View style={styles.contentPanel}>
        <Text
          style={[styles.reportText, isCompact && styles.reportTextCompact]}
          numberOfLines={5}
        >
          {item.content}
        </Text>
      </View>

      <View style={[styles.actionsRow, isCompact && styles.actionsRowCompact]}>
        <View style={styles.actionsSide}>
          <Pressable
            onPress={onStatus}
            style={({ pressed }) => [
              styles.statusButton,
              {
                backgroundColor: status.bg,
                borderColor: status.text,
              },
              pressed && styles.statusButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Statut : ${item.status}. Modifier`}
          >
            <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
            <Text
              style={[styles.statusText, { color: status.text }]}
              numberOfLines={1}
            >
              {item.status}
            </Text>
            <SquarePen size={12} color={status.text} />
          </Pressable>
        </View>

        <View style={styles.dateWrap}>
          {reportDate ? (
            <Text style={styles.reportDate} numberOfLines={1}>
              {reportDate}
            </Text>
          ) : null}
        </View>

        <View style={[styles.actionsSide, styles.actionsSideRight]}>
          <GradientButton
            icon={<MessageCircle size={28} color="white" />}
            colors={[colors.primary, colors.secondary]}
            onPress={onChat}
            width={isCompact ? 56 : 60}
            height={isCompact ? 56 : 60}
            style={styles.chatButton}
            title=""
          />
        </View>
      </View>
    </Animated.View>
  );
};

function createStyles(colors: AppColorPalette, surface: string) {
  return StyleSheet.create({
    card: {
      backgroundColor: surface,
      padding: 20,
      borderRadius: 20,
      marginBottom: 16,
      borderLeftWidth: 4,
      gap: 12,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
    },
    cardCompact: {
      padding: 16,
      borderRadius: 18,
      marginBottom: 12,
      borderLeftWidth: 4,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    authorBlock: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      minWidth: 0,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarNamed: {
      backgroundColor: colors.borderSubtle,
    },
    avatarAnonymous: {
      backgroundColor: colors.borderSubtle,
    },
    authorName: {
      flex: 1,
      minWidth: 0,
      fontSize: 16,
      fontWeight: "700",
    },
    detailsButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: colors.borderSubtle,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 44,
    },
    detailsButtonPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    detailsButtonText: {
      fontSize: 13,
      fontWeight: "800",
    },
    contentPanel: {
      backgroundColor: colors.background,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    reportText: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.text,
      fontWeight: "500",
    },
    reportTextCompact: {
      fontSize: 14,
      lineHeight: 21,
    },
    actionsRow: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 60,
      gap: 8,
    },
    actionsRowCompact: {
      minHeight: 56,
    },
    actionsSide: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
    },
    actionsSideRight: {
      justifyContent: "flex-end",
    },
    statusButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      minHeight: 34,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      borderWidth: 1,
    },
    statusButtonPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.99 }],
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusText: {
      flexShrink: 1,
      fontSize: 11,
      fontWeight: "700",
    },
    dateWrap: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
    },
    reportDate: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.textMuted,
      letterSpacing: 0.2,
      textAlign: "center",
    },
    chatButton: {
      borderRadius: 30,
      overflow: "hidden",
    },
  });
}
