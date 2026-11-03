import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ChatProvider } from '@/context/ChatContext';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';

function Shell() {
  const { loaded, colors, isDark } = useSettings();
  if (!loaded) return <View style={{ flex: 1, backgroundColor: '#0B0D10' }} />;
  return (
    <ChatProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="category/[id]" />
      </Stack>
    </ChatProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <Shell />
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
