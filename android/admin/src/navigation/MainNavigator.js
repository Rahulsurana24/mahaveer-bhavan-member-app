/**
 * MainNavigator - Admin App
 * Bottom Tab Navigator for admin users
 * 5 Tabs: Dashboard, Members, Events, Scanner, More
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import DashboardScreen from '../screens/Admin/DashboardScreen';
import MembersListScreen from '../screens/Admin/MembersListScreen';
import EventsListScreen from '../screens/Admin/EventsListScreen';
import ScannerScreen from '../screens/Admin/ScannerScreen';
import MoreMenuScreen from '../screens/Admin/MoreMenuScreen';

import colors from '../constants/colors';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Members':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Events':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Scanner':
              iconName = focused ? 'scan' : 'scan-outline';
              break;
            case 'More':
              iconName = focused ? 'menu' : 'menu-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.backgroundElevated,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="Members"
        component={MembersListScreen}
        options={{
          tabBarLabel: 'Members',
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsListScreen}
        options={{
          tabBarLabel: 'Events',
        }}
      />
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          tabBarLabel: 'Scanner',
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreMenuScreen}
        options={{
          tabBarLabel: 'More',
        }}
      />
    </Tab.Navigator>
  );
}
