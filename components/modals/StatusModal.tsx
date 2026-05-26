import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface StatusModalProps {
  visible: boolean;
  currentStatus: string;
  onSelect: (status: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const STATUS_STYLE_CONFIG: Record<string, { border: string; bg: string; text: string }> = {
  "Non traité": { border: "#ef4444", bg: "#fef2f2", text: "#ef4444" }, // Rouge
  "En cours":   { border: "#f59e0b", bg: "#fffbeb", text: "#f59e0b" }, // Orange
  "Résolu":     { border: "#10ac56", bg: "#e6f4f1", text: "#10ac56" }, // Vert
};

export const StatusModal = ({
  visible,
  currentStatus,
  onSelect,
  onConfirm,
  onCancel,
}: StatusModalProps) => {
  const statuses = ["Non traité", "En cours", "Résolu"];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Modifier le statut</Text>
          
          {statuses.map((s) => {
            // On récupère la configuration de couleur du statut actuel
            const isSelected = currentStatus === s;
            const statusColors = STATUS_STYLE_CONFIG[s];

            return (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusOption,
                  // Si le bouton est sélectionné, on applique ses couleurs personnalisées en ligne
                  isSelected && {
                    borderColor: statusColors.border,
                    backgroundColor: statusColors.bg,
                  },
                ]}
                onPress={() => onSelect(s)}
              >
                <Text
                  style={{
                    // Le texte prend aussi la couleur du statut s'il est sélectionné
                    color: isSelected ? statusColors.text : "#64748b",
                    fontWeight: "600",
                  }}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
            <Text style={styles.confirmBtnText}>Enregistrer</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  modalContent: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#023e8a",
    marginBottom: 20,
  },
  statusOption: {
    width: "100%",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginBottom: 10,
    alignItems: "center",
  },
  confirmBtn: {
    width: "100%",
    backgroundColor: "#023e8a",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  confirmBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  closeButton: {
    marginTop: 15,
  },
  cancelText: {
    color: "#94a3b8",
    fontWeight: "600",
  },
});