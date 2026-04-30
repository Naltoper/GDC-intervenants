import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface StatusModalProps {
  visible: boolean;
  currentStatus: string;
  onSelect: (status: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

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
          <Text style={styles.modalTitle}>Changer le statut</Text>
          
          {statuses.map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.statusOption,
                currentStatus === s && styles.statusOptionSelected,
              ]}
              onPress={() => onSelect(s)}
            >
              <Text
                style={{
                  color: currentStatus === s ? "#00b4d8" : "#64748b",
                  fontWeight: "600",
                }}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
            <Text style={styles.confirmBtnText}>Enregistrer</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <Text style={styles.cancelText}>Fermer</Text>
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
  statusOptionSelected: {
    borderColor: "#00b4d8",
    backgroundColor: "#f0f9ff",
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