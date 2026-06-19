import { Info, MessageCircle, Shield, User, FileText, SquarePen } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "../../constants/theme";
import { Report } from "../../types/report";
import { GradientButton } from "../buttons/GradientButton";

export const STATUS_COLORS: Record<
  string,
  { bg: string; dot: string; text: string }
> = {
  "En cours": {
    bg: Colors.light.status.warningBg,
    dot: Colors.light.status.warning,
    text: Colors.light.status.warningText,
  },
  Résolu: {
    bg: Colors.light.status.successBg,
    dot: Colors.light.status.success,
    text: Colors.light.status.successText,
  },
  "Non traité": {
    bg: Colors.light.status.errorBg,
    dot: Colors.light.status.error,
    text: Colors.light.status.errorText,
  },
};

interface ReportCardProps {
  item: Report;
  index?: number; // <-- Ajout pour décaler l'animation selon la position
  onDetails: () => void;
  onStatus: () => void;
  onChat: () => void;
}

export const ReportCard = ({
  item,
  index = 0,
  onDetails,
  onStatus,
  onChat,
}: ReportCardProps) => {
  const colors =
    STATUS_COLORS[item.status || ""] || STATUS_COLORS["Non traité"];

  return (
    // L'animation magique est ici : FadeInDown décale l'apparition de chaque carte de 100ms
    <Animated.View
      entering={FadeInDown.delay(index * 100)
        .springify()
        .damping(30)
        .mass(1.5)}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={styles.authorContainer}>
          {item.is_anonyme ? (
            <Shield size={16} color={Colors.light.textMuted} />
          ) : (
            <User size={16} color={Colors.light.primary} />
          )}
          <Text
            style={[
              styles.typeText,
              {
                color: item.is_anonyme
                  ? Colors.light.textMuted
                  : Colors.light.primary,
              },
            ]}
          >
            {item.is_anonyme ? " Anonyme" : ` ${item.author_name}`}
          </Text>
        </View>
        {/* Nouveau bouton de détails avec l'icône de document ET le texte */}
        <TouchableOpacity
          onPress={(event) => {
            event.stopPropagation();
            onDetails();
          }}
          style={styles.documentIconButton} // On garde ce nom de style
        >
          <FileText size={16} color="#023e8a" style={{ marginRight: 6 }} />
          <Text style={styles.documentButtonText}>Détails</Text>
        </TouchableOpacity> 
      </View>

      {/* MILIEU : Texte de la description limité à 5 lignes pour la lisibilité du Dashboard */}
      <Text style={styles.reportText} numberOfLines={5}>
        {item.content}
      </Text>

      {/* FOOTER : Aligne le statut à gauche et le bouton rond à droite sur la même ligne */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.text }]}
          onPress={onStatus}
        >
          <View style={[styles.dot, { backgroundColor: colors.dot }]} />
          <Text style={[styles.badgeText, { color: colors.text }]}>
            {item.status}
          </Text>
          <SquarePen size={12} color={colors.text} style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        {/* Le bouton "Répondre" devient un bouton rond placé tout à droite */}
        <GradientButton
          icon={<MessageCircle size={32} color="white" />}
          colors={[Colors.light.primaryLight, Colors.light.secondary]}
          onPress={onChat}
          width={70}
          height={70}
          // On passe le style directement au composant pour qu'il l'applique à son propre fond bleu
          style={{
            borderRadius: 30,
          }} title={""}        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
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
  reportText: { color: Colors.light.text, marginBottom: 15, lineHeight: 20 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between", // Pousse le statut à gauche et le bouton rond à droite
    alignItems: "center",            // Aligne les deux verticalement à la même hauteur
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderSubtle,
    paddingTop: 12,
    marginTop: 5,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12, // Légèrement plus moderne

    // 🟢 AJOUTS : Bordure fine + Ombre légère (iOS & Android)
    borderWidth: 1, // La couleur est gérée dynamiquement dans le JSX au-dessus
    elevation: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  badgeText: { fontSize: 10, fontWeight: "800" },
  dateText: { fontSize: 10, color: Colors.light.textMuted },
  infoIconButton: { padding: 5 },
  documentIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    
    // 🟢 AJOUTS : Bordure fine + Ombre légère (iOS & Android)
    borderWidth: 1,
    borderColor: '#7dd3fc', // Une couleur azur un peu plus foncée que le fond du bouton
    elevation: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  documentButtonText: {
    fontSize: 12,
    color: '#023e8a',
    fontWeight: '700',
  },
});
