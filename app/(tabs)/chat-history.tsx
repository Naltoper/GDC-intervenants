import { useRouter } from "expo-router";
import { MessageSquareText, Shield, User } from "lucide-react-native";
import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { PageHeader } from "../../components/headers/PageHeader";
import { ScreenShell } from "../../components/layout/ScreenShell";
import type { AppColorPalette } from "../../constants/theme";
import { useAppTheme } from "../../contexts/ThemeContext";
import { ChatHistoryItem, useChatHistory } from "../../hooks/useChatHistory";
import { usePullToRefresh } from "../../hooks/usePullToRefresh";

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function ChatHistoryScreen() {
  const router = useRouter();
  const { colors, surface } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, surface), [colors, surface]);
  const { items, loading, refreshing, refresh } = useChatHistory();

  const pullRefresh = usePullToRefresh({
    refreshing,
    onRefresh: refresh,
    tintColor: colors.primaryLight,
  });

  const renderItem = ({ item }: { item: ChatHistoryItem }) => {
    const author = item.report.is_anonyme
      ? "Anonyme"
      : item.report.author_name?.trim() || "Élève";

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() =>
          router.push({
            pathname: "/chat/[id]",
            params: { id: item.report.id, role: "admin", from: "chat-history" },
          })
        }
      >
        <View style={styles.cardHeader}>
          <View style={styles.authorBlock}>
            <View style={styles.avatar}>
              {item.report.is_anonyme ? (
                <Shield size={16} color={colors.textMuted} />
              ) : (
                <User size={16} color={colors.accent} />
              )}
            </View>
            <Text style={styles.authorName} numberOfLines={1}>
              {author}
            </Text>
          </View>
          <Text style={styles.date}>{formatDate(item.lastMessageAt)}</Text>
        </View>

        <Text style={styles.preview} numberOfLines={2}>
          {item.lastMessage || "Conversation ouverte"}
        </Text>

        <View style={styles.footer}>
          <MessageSquareText size={14} color={colors.secondary} />
          <Text style={styles.footerText}>
            {item.messageCount} message{item.messageCount === 1 ? "" : "s"}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenShell>
      <PageHeader
        title="Historique des chats"
        subtitle={`${items.length} conversation${items.length === 1 ? "" : "s"}`}
        onBack={() => router.replace("/(tabs)/dashboard")}
      />

      {loading && !refreshing ? (
        <ActivityIndicator
          size="large"
          color={colors.primaryLight}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.report.id}
          contentContainerStyle={styles.listContent}
          {...pullRefresh}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Aucun chat pour le moment</Text>
              <Text style={styles.emptyText}>
                Les conversations avec les élèves apparaîtront ici.
              </Text>
            </View>
          }
          renderItem={renderItem}
        />
      )}
    </ScreenShell>
  );
}

function createStyles(colors: AppColorPalette, surface: string) {
  return StyleSheet.create({
    loader: {
      marginTop: 48,
    },
    listContent: {
      paddingTop: 12,
      paddingBottom: 24,
      paddingHorizontal: 20,
      flexGrow: 1,
    },
    card: {
      backgroundColor: surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 3,
    },
    cardPressed: {
      opacity: 0.9,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
      gap: 10,
    },
    authorBlock: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      minWidth: 0,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: colors.borderSubtle,
      alignItems: "center",
      justifyContent: "center",
    },
    authorName: {
      flex: 1,
      fontSize: 15,
      fontWeight: "700",
      color: colors.accent,
    },
    date: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: "500",
    },
    preview: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.text,
      marginBottom: 12,
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    footerText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textMuted,
    },
    empty: {
      marginTop: 40,
      alignItems: "center",
      paddingHorizontal: 20,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.accent,
      marginBottom: 6,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: "center",
    },
  });
}
