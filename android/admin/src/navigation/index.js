/**
 * RootNavigator - Admin App
 * Main navigation entry point with auth state management
 * Only allows admin, super_admin, partial_admin, view_only roles
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet, Alert } from 'react-native';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import ChangePasswordScreen from '../screens/Auth/ChangePasswordScreen';

// Import placeholder admin screens
import MemberDetailScreen from '../screens/Admin/MemberDetailScreen';
import CreateMemberScreen from '../screens/Admin/CreateMemberScreen';
import SystemSettingsScreen from '../screens/Admin/SystemSettingsScreen';
import GalleryModerationScreen from '../screens/Admin/GalleryModerationScreen';
import CalendarScreen from '../screens/Admin/CalendarScreen';

import { supabase } from '../services/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../constants/colors';

const Stack = createStackNavigator();

const ADMIN_ROLES = ['admin', 'super_admin', 'superadmin', 'partial_admin', 'view_only'];

export default function RootNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);

  useEffect(() => {
    checkAuthStatus();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await handleSignIn(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setNeedsPasswordChange(false);
          await AsyncStorage.removeItem('admin_profile');
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        await handleSignIn(session.user);
      } else {
        const cachedProfile = await AsyncStorage.getItem('admin_profile');
        if (cachedProfile) {
          const profile = JSON.parse(cachedProfile);
          setUser(profile);
          setNeedsPasswordChange(profile.needs_password_change || false);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (authUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          role:user_roles(*)
        `)
        .eq('auth_id', authUser.id)
        .single();

      if (error || !profile) {
        console.error('Error fetching profile:', error);
        await supabase.auth.signOut();
        return;
      }

      // Check if user has admin role
      if (!ADMIN_ROLES.includes(profile.role?.name)) {
        Alert.alert(
          'Access Denied',
          'This app is for administrators only. Please use the Member app.',
          [{ text: 'OK', onPress: async () => await supabase.auth.signOut() }]
        );
        return;
      }

      const userProfile = {
        ...profile,
        auth_id: authUser.id,
        email: authUser.email,
      };

      await AsyncStorage.setItem('admin_profile', JSON.stringify(userProfile));
      setUser(userProfile);
      setNeedsPasswordChange(profile.needs_password_change || false);

      // Update last login
      await supabase
        .from('user_profiles')
        .update({
          last_login: new Date().toISOString(),
          login_count: (profile.login_count || 0) + 1,
        })
        .eq('auth_id', authUser.id);

    } catch (error) {
      console.error('Error handling sign in:', error);
      setUser(null);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.background },
        }}
      >
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : needsPasswordChange ? (
          <Stack.Screen
            name="ForcePasswordChange"
            component={ChangePasswordScreen}
            initialParams={{ forced: true, user: user }}
            options={{ gestureEnabled: false }}
          />
        ) : (
          <>
            <Stack.Screen name="MainApp" component={MainNavigator} />

            {/* Modal Screens */}
            <Stack.Group screenOptions={{ presentation: 'modal' }}>
              <Stack.Screen
                name="MemberDetail"
                component={MemberDetailScreen}
                options={{
                  headerShown: true,
                  title: 'Member Details',
                  headerStyle: { backgroundColor: colors.backgroundElevated },
                  headerTintColor: colors.textPrimary,
                }}
              />
              <Stack.Screen
                name="CreateMember"
                component={CreateMemberScreen}
                options={{
                  headerShown: true,
                  title: 'Create Member',
                  headerStyle: { backgroundColor: colors.backgroundElevated },
                  headerTintColor: colors.textPrimary,
                }}
              />
              <Stack.Screen
                name="SystemSettings"
                component={SystemSettingsScreen}
                options={{
                  headerShown: true,
                  title: 'System Settings',
                  headerStyle: { backgroundColor: colors.backgroundElevated },
                  headerTintColor: colors.textPrimary,
                }}
              />
              <Stack.Screen
                name="GalleryModeration"
                component={GalleryModerationScreen}
                options={{
                  headerShown: true,
                  title: 'Gallery Moderation',
                  headerStyle: { backgroundColor: colors.backgroundElevated },
                  headerTintColor: colors.textPrimary,
                }}
              />
              <Stack.Screen
                name="Calendar"
                component={CalendarScreen}
                options={{
                  headerShown: true,
                  title: 'Calendar Management',
                  headerStyle: { backgroundColor: colors.backgroundElevated },
                  headerTintColor: colors.textPrimary,
                }}
              />
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
