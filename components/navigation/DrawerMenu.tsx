import { BarChart3, MessageSquareText, X } from "lucide-react-native";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "../../constants/theme";

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
  onStatistics: () => void;
  onChatHistory: () => void;
}

export const DrawerMenu = ({
  visible,
  onClose,
  onStatistics,
  onChatHistory,
}: DrawerMenuProps) => (
  <Modal
    visible={visible}
    animationType="fade"
    transparent
    onRequestClose={onClose}
  >
    <View style={styles.overlay}>
      <View style={styles.drawer}>
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>Menu</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Fermer le menu"
          >
            <X size={22} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={onStatistics}
          activeOpacity={0.75}
        >
          <View style={[styles.iconWrap, styles.iconStats]}>
            <BarChart3 size={20} color={Colors.light.primary} />
          </View>
          <View style={styles.menuTextWrap}>
            <Text style={styles.menuLabel}>Statistiques</Text>
            <Text style={styles.menuHint}>Vue d’ensemble des signalements</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={onChatHistory}
          activeOpacity={0.75}
        >
          <View style={[styles.iconWrap, styles.iconChats]}>
            <MessageSquareText size={20} color={Colors.light.secondary} />
          </View>
          <View style={styles.menuTextWrap}>
            <Text style={styles.menuLabel}>Historique des chats</Text>
            <Text style={styles.menuHint}>
              Conversations intervenants / élèves
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <Pressable style={styles.backdrop} onPress={onClose} />
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(15, 23, 42, 0.35)",
  },
  backdrop: {
    flex: 1,
  },
  drawer: {
    width: "78%",
    maxWidth: 320,
    height: "100%",
    backgroundColor: Colors.light.surface,
    paddingTop: 20,
    paddingHorizontal: 18,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 2,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderSubtle,
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.light.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: Colors.light.borderSubtle,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: Colors.light.background,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconStats: {
    backgroundColor: "#E8F4FD",
  },
  iconChats: {
    backgroundColor: "#E0F7FA",
  },
  menuTextWrap: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.light.text,
    marginBottom: 2,
  },
  menuHint: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "500",
  },
});
