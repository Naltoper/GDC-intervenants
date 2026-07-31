import { useRouter } from "expo-router";
import { MessageSquareText, Shield, User } from "lucide-react-native";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated from "react-native-reanimated";

import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { DashboardPageTitle } from "../../components/dashboard/DashboardPageTitle";
import { DASHBOARD_HEADER } from "../../constants/dashboard";
import { Colors } from "../../constants/theme";
import { useCollapsingHeader } from "../../hooks/useCollapsingHeader";
import { ChatHistoryItem, useChatHistory } from "../../hooks/useChatHistory";

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
  const { items, loading, refreshing, refresh } = useChatHistory();
  const { scrollHandler, stickyBarStyle, stickyTitleStyle } =
    useCollapsingHeader();

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
            params: { id: item.report.id, role: "admin" },
          })
        }
      >
        <View style={styles.cardHeader}>
          <View style={styles.authorBlock}>
            <View style={styles.avatar}>
              {item.report.is_anonyme ? (
                <Shield size={16} color={Colors.light.textMuted} />
              ) : (
                <User size={16} color={Colors.light.primary} />
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
          <MessageSquareText size={14} color={Colors.light.secondary} />
          <Text style={styles.footerText}>
            {item.messageCount} message{item.messageCount === 1 ? "" : "s"}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/lyceeBgBlur.png")}
        style={styles.screenBackground}
        imageStyle={styles.screenBackgroundImage}
        resizeMode="cover"
      >
        <DashboardHeader
          onBack={() => router.replace("/(tabs)/dashboard")}
          stickyBarStyle={stickyBarStyle}
          stickyTitleStyle={stickyTitleStyle}
          stickyTitle="Historique des chats"
        />

        {loading && !refreshing ? (
          <ActivityIndicator
            size="large"
            color={Colors.light.primary}
            style={styles.loader}
          />
        ) : (
          <Animated.FlatList
            data={items}
            keyExtractor={(item) => item.report.id}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <DashboardPageTitle
                reportCount={items.length}
                title="Historique des chats"
                subtitle={`${items.length} conversation${
                  items.length === 1 ? "" : "s"
                }`}
              />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Aucun chat pour le moment</Text>
                <Text style={styles.emptyText}>
                  Les conversations avec les élèves apparaîtront ici.
                </Text>
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                progressViewOffset={DASHBOARD_HEADER.STICKY_HEIGHT}
              />
            }
            renderItem={renderItem}
          />
        )}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#b6d9ff",
  },
  screenBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  screenBackgroundImage: {
    opacity: 0.5,
  },
  loader: {
    marginTop: DASHBOARD_HEADER.STICKY_HEIGHT + 40,
  },
  listContent: {
    paddingTop: DASHBOARD_HEADER.STICKY_HEIGHT + 8,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: 16,
    marginBottom: 12,
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
    backgroundColor: "#E8F4FD",
    alignItems: "center",
    justifyContent: "center",
  },
  authorName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.light.primary,
  },
  date: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "500",
  },
  preview: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.text,
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
    color: Colors.light.textMuted,
  },
  empty: {
    marginTop: 40,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.light.primary,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textMuted,
    textAlign: "center",
  },
});
