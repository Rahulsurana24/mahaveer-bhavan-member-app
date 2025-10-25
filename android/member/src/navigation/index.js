/**
 * RootNavigator
 * Main navigation entry point with auth state management
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import ChangePasswordScreen from '../screens/Auth/ChangePasswordScreen';

// Modal Screens
import IDCardScreen from '../screens/Member/IDCardScreen';
import ProfileScreen from '../screens/Member/ProfileScreen';
import EditProfileScreen from '../screens/Member/EditProfileScreen';
import NotificationSettingsScreen from '../screens/Member/NotificationSettingsScreen';
import AIAssistantScreen from '../screens/Member/AIAssistantScreen';
import EventDetailScreen from '../screens/Member/EventDetailScreen';
import EventRegistrationScreen from '../screens/Member/EventRegistrationScreen';
import RegistrationSuccessScreen from '../screens/Member/RegistrationSuccessScreen';
import TripDetailScreen from '../screens/Member/TripDetailScreen';
import TripRegistrationScreen from '../screens/Member/TripRegistrationScreen';
import TripRegistrationSuccessScreen from '../screens/Member/TripRegistrationSuccessScreen';
import ChatScreen from '../screens/Member/ChatScreen';
import CallScreen from '../screens/Member/CallScreen';
import IncomingCallScreen from '../screens/Member/IncomingCallScreen';
import PhotoViewerScreen from '../screens/Member/PhotoViewerScreen';
import CommentsScreen from '../screens/Member/CommentsScreen';
import UploadMediaScreen from '../screens/Member/UploadMediaScreen';
import StoryViewerScreen from '../screens/Member/StoryViewerScreen';

import { supabase } from '../services/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../constants/colors';
import CallListener from '../components/CallListener';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);

  useEffect(() => {
    // Check for existing session
    checkAuthStatus();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await handleSignIn(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setNeedsPasswordChange(false);
          await AsyncStorage.removeItem('user_profile');
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  /**
   * Check for existing authentication
   */
  const checkAuthStatus = async () => {
    try {
      // Check for Supabase session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        await handleSignIn(session.user);
      } else {
        // No session, check AsyncStorage for cached profile
        const cachedProfile = await AsyncStorage.getItem('user_profile');
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

  /**
   * Handle user sign in - fetch profile and role
   */
  const handleSignIn = async (authUser) => {
    try {
      // Fetch user profile with role information
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          role:user_roles(*)
        `)
        .eq('auth_id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setUser(null);
        return;
      }

      if (!profile) {
        console.error('No profile found for user');
        setUser(null);
        return;
      }

      // Check if user is a member (not admin)
      if (profile.role?.name !== 'member') {
        // Wrong app - this user should use admin app
        console.warn('User is not a member, redirecting to logout');
        await supabase.auth.signOut();
        return;
      }

      // Store user profile
      const userProfile = {
        ...profile,
        auth_id: authUser.id,
        email: authUser.email,
      };

      await AsyncStorage.setItem('user_profile', JSON.stringify(userProfile));
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
          // Not authenticated - show auth screens
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : needsPasswordChange ? (
          // Authenticated but needs password change - force change screen
          <Stack.Screen
            name="ForcePasswordChange"
            component={ChangePasswordScreen}
            initialParams={{ forced: true, user: user }}
            options={{
              gestureEnabled: false, // Prevent going back
            }}
          />
        ) : (
          // Authenticated and password changed - show main app
          <>
            <Stack.Screen name="MainApp" component={MainNavigator} />

            {/* Modal Screens */}
            <Stack.Group screenOptions={{ presentation: 'modal' }}>
              <Stack.Screen
                name="IDCard"
                component={IDCardScreen}
                options={{
                  headerShown: true,
                  title: 'Digital ID Card',
                  headerStyle: { backgroundColor: colors.backgroundElevated },
                  headerTintColor: colors.textPrimary,
                }}
              />
              <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                  headerShown: true,
                  title: 'Profile',
                  headerStyle: { backgroundColor: colors.backgroundElevated },
                  headerTintColor: colors.textPrimary,
                }}
              />
              <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{
                  headerShown: true,
                  title: 'Edit Profile',
                  headerStyle: { backgroundColor: colors.backgroundElevated },
                  headerTintColor: colors.textPrimary,
                }}
              />
              <Stack.Screen
                name="NotificationSettings"
                component={NotificationSettingsScreen}
                options={{
                  headerShown: true,
                  title: 'Notifications',
                  headerStyle: { backgroundColor: colors.backgroundElevated },
                  headerTintColor: colors.textPrimary,
                }}
              />
              <Stack.Screen
                name="AIAssistant"
                component={AIAssistantScreen}
                options={{
                  headerShown: true,
                  title: 'Dharma AI Assistant',
                  headerStyle: { backgroundColor: colors.backgroundElevated },
                  headerTintColor: colors.textPrimary,
                }}
              />
              <Stack.Screen
                name="EventDetail"
                component={EventDetailScreen}
                options={{
                  headerShown: true,
                  title: 'Event Details',
                  headerStyle: { backgroundColor: colors.backgroundElevated },
                  headerTintColor: colors.textPrimary,
                }}
              />
              <Stack.Screen
                name="EventRegistration"
                component={EventRegistrationScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="RegistrationSuccess"
                component={RegistrationSuccessScreen}
                options={{
                  headerShown: false,
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen
                name="TripDetail"
                component={TripDetailScreen}
                options={{
                  headerShown: true,
                  title: 'Trip Details',
                  headerStyle: { backgroundColor: colors.backgroundElevated },
                  headerTintColor: colors.textPrimary,
                }}
              />
              <Stack.Screen
                name="TripRegistration"
                component={TripRegistrationScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="TripRegistrationSuccess"
                component={TripRegistrationSuccessScreen}
                options={{
                  headerShown: false,
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={{
                  headerShown: true,
                  title: 'Chat',
                  headerStyle: { backgroundColor: colors.backgroundElevated },
                  headerTintColor: colors.textPrimary,
                }}
              />
              <Stack.Screen
                name="Call"
                component={CallScreen}
                options={{
                  headerShown: false,
                  presentation: 'fullScreenModal',
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen
                name="IncomingCall"
                component={IncomingCallScreen}
                options={{
                  headerShown: false,
                  presentation: 'fullScreenModal',
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen
                name="PhotoViewer"
                component={PhotoViewerScreen}
                options={{
                  headerShown: false,
                  presentation: 'transparentModal',
                }}
              />
              <Stack.Screen
                name="Comments"
                component={CommentsScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="UploadMedia"
                component={UploadMediaScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="StoryViewer"
                component={StoryViewerScreen}
                options={{
                  headerShown: false,
                  presentation: 'fullScreenModal',
                }}
              />
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
      {/* Global call listener - only active when authenticated */}
      {user && !needsPasswordChange && <CallListener />}
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
