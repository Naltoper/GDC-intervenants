import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { DashboardPageTitle } from "../../components/dashboard/DashboardPageTitle";
import { DashboardStatusGrid } from "../../components/dashboard/DashboardStatusGrid";
import { DrawerMenu } from "../../components/navigation/DrawerMenu";
import { DASHBOARD_HEADER } from "../../constants/dashboard";
import { Colors } from "../../constants/theme";
import { useCollapsingHeader } from "../../hooks/useCollapsingHeader";
import { useDashboard } from "../../hooks/useDashboard";

export default function DashboardScreen() {
  const router = useRouter();
  const dashboard = useDashboard();
  const { scrollHandler, stickyBarStyle, stickyTitleStyle } =
    useCollapsingHeader();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openFilter = (filterKey: string) => {
    router.push({
      pathname: "/(tabs)/reports",
      params: { filter: filterKey },
    });
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
          showMenu
          onMenuPress={() => setDrawerOpen(true)}
          stickyBarStyle={stickyBarStyle}
          stickyTitleStyle={stickyTitleStyle}
        />

        {dashboard.loading && !dashboard.refreshing ? (
          <ActivityIndicator
            size="large"
            color={Colors.light.primary}
            style={styles.loader}
          />
        ) : (
          <ScrollView
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            contentContainerStyle={styles.content}
            refreshControl={
              <RefreshControl
                refreshing={dashboard.refreshing}
                onRefresh={dashboard.fetchReports}
                progressViewOffset={DASHBOARD_HEADER.STICKY_HEIGHT}
              />
            }
          >
            <DashboardPageTitle reportCount={dashboard.reports.length} />
            <DashboardStatusGrid
              cards={dashboard.statusCards}
              onSelect={openFilter}
            />
          </ScrollView>
        )}

        <DrawerMenu
          visible={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onStatistics={() => {
            setDrawerOpen(false);
            router.push("/(tabs)/statistics");
          }}
          onChatHistory={() => {
            setDrawerOpen(false);
            router.push("/(tabs)/chat-history");
          }}
        />
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
  content: {
    paddingTop: DASHBOARD_HEADER.STICKY_HEIGHT + 8,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  loader: {
    marginTop: DASHBOARD_HEADER.STICKY_HEIGHT + 40,
  },
});
