import { StyleSheet, View } from "react-native";

import { DashboardStatusCard, DashboardStatusCardData } from "./DashboardStatusCard";

interface DashboardStatusGridProps {
  cards: DashboardStatusCardData[];
  onSelect: (filterKey: string) => void;
}

/** Layout : « Tous » pleine largeur, puis 3 statuts sur une ligne. */
export const DashboardStatusGrid = ({
  cards,
  onSelect,
}: DashboardStatusGridProps) => {
  const tousCard = cards.find((card) => card.key === "Tous");
  const statusCards = cards.filter((card) => card.key !== "Tous");

  return (
    <View style={styles.grid}>
      {tousCard ? (
        <DashboardStatusCard
          card={tousCard}
          fullWidth
          onPress={() => onSelect(tousCard.key)}
        />
      ) : null}

      <View style={styles.statusRow}>
        {statusCards.map((card) => (
          <DashboardStatusCard
            key={card.key}
            card={card}
            compact
            onPress={() => onSelect(card.key)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: 12,
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
  },
});
