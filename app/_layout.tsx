import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    console.log('✅ App Started');
    console.log('SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing');
    console.log('SUPABASE_ANON_KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
