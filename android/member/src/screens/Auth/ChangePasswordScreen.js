/**
 * ChangePasswordScreen
 * Forces user to change password on first login
 * No back button - user is trapped until password changed
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import colors from '../../constants/colors';
import { supabase } from '../../services/supabase/client';

export default function ChangePasswordScreen({ navigation, route }) {
  const { forced = true, user } = route.params || {};

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /**
   * Validate password requirements
   */
  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('One number');
    }

    return errors;
  };

  /**
   * Validate all fields
   */
  const validate = () => {
    const newErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const passwordErrors = validatePassword(newPassword);
      if (passwordErrors.length > 0) {
        newErrors.newPassword = 'Password must have: ' + passwordErrors.join(', ');
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle password change
   */
  const handleChangePassword = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      // Update password in Supabase Auth
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      // Update needs_password_change flag in user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          needs_password_change: false,
          password_changed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('auth_id', user?.id || updateData.user?.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        // Continue anyway - password was changed successfully
      }

      // Log the password change
      await supabase.from('audit_logs').insert({
        user_id: user?.id || updateData.user?.id,
        action: 'password_changed',
        action_type: 'password_changed',
        details: {
          forced_change: forced,
          timestamp: new Date().toISOString(),
        },
      });

      Alert.alert(
        'Success',
        'Your password has been changed successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (forced) {
                // Navigate to main app
                navigation.replace('MainApp');
              } else {
                // Go back to profile/settings
                navigation.goBack();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error changing password:', error);

      let errorMessage = 'Failed to change password. Please try again.';

      if (error.message?.includes('Password')) {
        errorMessage = error.message;
      } else if (error.message?.includes('Invalid')) {
        errorMessage = 'Current password is incorrect. Please try again.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Icon name="lock-closed" size={48} color={colors.primary} />
            </View>
            <Text style={styles.title}>
              {forced ? 'Change Your Password' : 'Update Password'}
            </Text>
            <Text style={styles.subtitle}>
              {forced
                ? 'For security reasons, please change your password before continuing.'
                : 'Enter your current password and choose a new one.'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Current Password */}
            <Input
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter your current password"
              secureTextEntry
              autoCapitalize="none"
              error={errors.currentPassword}
              editable={!loading}
            />

            {/* New Password */}
            <Input
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Choose a strong password"
              secureTextEntry
              autoCapitalize="none"
              error={errors.newPassword}
              editable={!loading}
            />

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Password must contain:</Text>
              <View style={styles.requirementsList}>
                <RequirementItem
                  text="At least 8 characters"
                  met={newPassword.length >= 8}
                />
                <RequirementItem
                  text="One uppercase letter (A-Z)"
                  met={/[A-Z]/.test(newPassword)}
                />
                <RequirementItem
                  text="One lowercase letter (a-z)"
                  met={/[a-z]/.test(newPassword)}
                />
                <RequirementItem
                  text="One number (0-9)"
                  met={/[0-9]/.test(newPassword)}
                />
              </View>
            </View>

            {/* Confirm Password */}
            <Input
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your new password"
              secureTextEntry
              autoCapitalize="none"
              error={errors.confirmPassword}
              editable={!loading}
            />

            {/* Submit Button */}
            <Button
              title={forced ? 'Change Password & Continue' : 'Update Password'}
              onPress={handleChangePassword}
              loading={loading}
              style={styles.submitButton}
            />

            {forced && (
              <View style={styles.warningContainer}>
                <Icon name="information-circle-outline" size={20} color={colors.warning} />
                <Text style={styles.warningText}>
                  You must change your password to continue using the app
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/**
 * Password requirement item component
 */
function RequirementItem({ text, met }) {
  return (
    <View style={styles.requirementItem}>
      <Icon
        name={met ? 'checkmark-circle' : 'close-circle'}
        size={16}
        color={met ? colors.success : colors.textTertiary}
      />
      <Text style={[styles.requirementText, met && styles.requirementTextMet]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  form: {
    flex: 1,
  },
  requirementsContainer: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  requirementsList: {
    gap: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  requirementTextMet: {
    color: colors.success,
  },
  submitButton: {
    marginTop: 8,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.warning}20`,
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.warning,
    lineHeight: 18,
  },
});
