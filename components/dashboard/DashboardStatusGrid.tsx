import { StyleSheet, View } from "react-native";

import { DashboardStatusCard, DashboardStatusCardData } from "./DashboardStatusCard";

interface DashboardStatusGridProps {
  cards: DashboardStatusCardData[];
  onSelect: (filterKey: string) => void;
}

export const DashboardStatusGrid = ({
  cards,
  onSelect,
}: DashboardStatusGridProps) => (
  <View style={styles.grid}>
    {cards.map((card) => (
      <DashboardStatusCard
        key={card.key}
        card={card}
        onPress={() => onSelect(card.key)}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
    columnGap: 8,
  },
});
