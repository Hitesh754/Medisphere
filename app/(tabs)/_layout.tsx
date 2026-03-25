import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Home, Pill, FolderLock, UtensilsCrossed } from 'lucide-react-native';
import ChatBot from '@/components/ChatBot';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#2563EB',
          tabBarInactiveTintColor: '#94A3B8',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E2E8F0',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ size, color }) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="prescriptions"
          options={{
            title: 'Prescriptions',
            tabBarIcon: ({ size, color }) => (
              <Pill size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="medilocker"
          options={{
            title: 'MediLocker',
            tabBarIcon: ({ size, color }) => (
              <FolderLock size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="meals"
          options={{
            title: 'Meals',
            tabBarIcon: ({ size, color }) => (
              <UtensilsCrossed size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      <ChatBot />
    </View>
  );
}