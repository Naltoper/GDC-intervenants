import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, ViewStyle } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ThemeProvider, useAppTheme } from '../contexts/ThemeContext';

export default function RootLayout() {
  const webStyle: ViewStyle =
    Platform.OS === 'web'
      ? {
          height: '100dvh' as unknown as number,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'visible',
        }
      : {};

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedRootShell webStyle={webStyle} />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedRootShell({ webStyle }: { webStyle: ViewStyle }) {
  const { surface, isDark } = useAppTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView
        style={[styles.container, { backgroundColor: surface }, webStyle]}
        edges={['top', 'bottom']}
      >
        <Stack
          screenOptions={{
            headerShown: false,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: surface, flex: 1 },
          }}
        >
          <Stack.Screen name="(tabs)/index" />
          <Stack.Screen name="(tabs)/login" />
          <Stack.Screen name="(tabs)/dashboard" />
          <Stack.Screen name="(tabs)/reports" />
          <Stack.Screen name="(tabs)/statistics" />
          <Stack.Screen name="(tabs)/chat-history" />
          <Stack.Screen name="chat/[id]" />
        </Stack>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
});
