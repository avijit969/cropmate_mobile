import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { theme } from '@/constants/theme';
import { wp } from '@/helpers/common';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

// Example: Replace with your actual auth/user hook
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux'; // or your auth provider

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Example: Get role from your store or context
  const user = useSelector((state: RootState) => state.user); // <-- adjust to your state
  const isAdmin = user?.user.email === 'admin@cropmate.com';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
        tabBarLabelStyle: {
          fontSize: wp(3),
          fontWeight: 'bold',
          width: wp(100),
        },

      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="home-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="prediction"
        options={{
          title: 'Prediction',
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="cloud-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recommendation"
        options={{
          title: 'Recommendation',
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="star-outline" color={color} />
          ),
        }}
      />

      {/* Show Collection tab only if admin */}
      <Tabs.Protected guard={isAdmin}>
        <Tabs.Screen
          name="collection"
          options={{
            title: 'Collection',
            tabBarIcon: ({ color }) => (
              <Ionicons
                size={28}
                name="document-text-outline"
                color={color}
              />
            ),
          }}
        />
      </Tabs.Protected>
    </Tabs>
  );
}
