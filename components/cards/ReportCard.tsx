import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Shield, User, Info, MessageCircle } from 'lucide-react-native';
import { GradientButton } from '../buttons/GradientButton';
import { Report } from '../../types/report';

// On déplace les constantes de couleurs ici car elles sont liées au design de la carte
export const STATUS_COLORS: Record<string, { bg: string; dot: string; text: string }> = {
  "En cours": { bg: "#fff7ed", dot: "#f97316", text: "#ea7f0c" },
  "Résolu": { bg: "#f0fdf4", dot: "#22c55e", text: "#16a34a" },
  "Non traité": { bg: "#eff6ff", dot: "#d53f3f", text: "#eb2525" },
};

interface ReportCardProps {
  item: Report;
  onDetails: () => void;
  onStatus: () => void;
  onChat: () => void;
}

export const ReportCard = ({ item, onDetails, onStatus, onChat }: ReportCardProps) => {
  const colors = STATUS_COLORS[item.status || ""] || STATUS_COLORS["Non traité"];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.authorContainer}>
          {item.is_anonyme ? (
            <Shield size={16} color="#64748b" />
          ) : (
            <User size={16} color="#023e8a" />
          )}
          <Text
            style={[
              styles.typeText,
              { color: item.is_anonyme ? "#64748b" : "#023e8a" },
            ]}
          >
            {item.is_anonyme ? " Anonyme" : ` ${item.author_name}`}
          </Text>
        </View>
        <TouchableOpacity onPress={onDetails} style={styles.infoIconButton}>
          <Info size={22} color="#00b4d8" />
        </TouchableOpacity>
      </View>

      <Text style={styles.reportText} numberOfLines={3}>
        {item.content}
      </Text>

      <View style={styles.buttonWrapper}>
        <GradientButton
          title="Répondre"
          icon={<MessageCircle size={18} color="white" />}
          colors={["#48a4f4", "#00b4d8"]}
          onPress={onChat}
          width="100%"
          height={80}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.badge, { backgroundColor: colors.bg }]}
          onPress={onStatus}
        >
          <View style={[styles.dot, { backgroundColor: colors.dot }]} />
          <Text style={[styles.badgeText, { color: colors.text }]}>
            {item.status}
          </Text>
        </TouchableOpacity>
        <Text style={styles.dateText}>
          {item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  authorContainer: { flexDirection: "row", alignItems: "center" },
  typeText: { fontWeight: "700" },
  reportText: { color: "#334155", marginBottom: 15, lineHeight: 20 },
  buttonWrapper: { marginBottom: 15 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  badgeText: { fontSize: 10, fontWeight: "800" },
  dateText: { fontSize: 10, color: "#94a3b8" },
  infoIconButton: { padding: 5 },
});