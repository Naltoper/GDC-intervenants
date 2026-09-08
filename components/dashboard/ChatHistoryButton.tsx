import { MessageSquareText } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../contexts/ThemeContext";

type ChatHistoryButtonProps = {
  onPress: () => void;
};

export function ChatHistoryButton({ onPress }: ChatHistoryButtonProps) {
  const { colors, surface } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: surface,
          borderColor: colors.border,
        },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Historique des chats"
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: colors.borderSubtle,
            borderColor: colors.border,
          },
        ]}
      >
        <MessageSquareText size={22} color={colors.accent} strokeWidth={2.4} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: colors.text }]}>
          Historique des chats
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Conversations avec les élèves
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
  },
});
