/**
 * Edit Profile Screen
 * Allows members to edit their personal information
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { supabase } from '../../services/supabase/client';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function EditProfileScreen({ navigation }) {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    mobile: '',
    whatsapp: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
    bloodGroup: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
  });

  const [errors, setErrors] = useState({});

  /**
   * Load profile data on mount
   */
  useEffect(() => {
    if (profile) {
      setFormData({
        mobile: profile.mobile || '',
        whatsapp: profile.whatsapp || profile.mobile || '',
        email: profile.email || '',
        addressLine1: profile.address?.line1 || '',
        addressLine2: profile.address?.line2 || '',
        city: profile.address?.city || '',
        state: profile.address?.state || '',
        pinCode: profile.address?.pin_code || '',
        bloodGroup: profile.blood_group || '',
        emergencyName: profile.emergency_contact?.name || '',
        emergencyPhone: profile.emergency_contact?.phone || '',
        emergencyRelation: profile.emergency_contact?.relation || '',
      });
    }
  }, [profile]);

  /**
   * Update form data
   */
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  /**
   * Validate form
   */
  const validate = () => {
    const newErrors = {};

    // Mobile validation
    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = 'Invalid mobile number';
    }

    // WhatsApp validation (optional, but if provided must be valid)
    if (formData.whatsapp && !/^[6-9]\d{9}$/.test(formData.whatsapp)) {
      newErrors.whatsapp = 'Invalid WhatsApp number';
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    // Address validation
    if (!formData.addressLine1?.trim()) {
      newErrors.addressLine1 = 'Address is required';
    }
    if (!formData.city?.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    if (!/^\d{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = 'Invalid PIN code';
    }

    // Emergency contact validation
    if (formData.emergencyName && !formData.emergencyPhone) {
      newErrors.emergencyPhone = 'Emergency phone is required';
    }
    if (formData.emergencyPhone && !/^[6-9]\d{9}$/.test(formData.emergencyPhone)) {
      newErrors.emergencyPhone = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle save
   */
  const handleSave = async () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return;
    }

    setLoading(true);

    try {
      // Prepare update data
      const updateData = {
        mobile: formData.mobile.trim(),
        whatsapp: formData.whatsapp.trim() || formData.mobile.trim(),
        email: formData.email.toLowerCase().trim(),
        address: {
          line1: formData.addressLine1.trim(),
          line2: formData.addressLine2.trim(),
          city: formData.city.trim(),
          state: formData.state,
          pin_code: formData.pinCode,
        },
        blood_group: formData.bloodGroup || null,
        emergency_contact: {
          name: formData.emergencyName.trim(),
          phone: formData.emergencyPhone,
          relation: formData.emergencyRelation,
        },
        updated_at: new Date().toISOString(),
      };

      // Update member record
      const { error: updateError } = await supabase
        .from('members')
        .update(updateData)
        .eq('id', profile?.id);

      if (updateError) throw updateError;

      // Log the update
      await supabase.from('audit_logs').insert({
        user_id: profile?.id,
        action: 'profile_updated',
        action_type: 'profile_updated',
        details: {
          updated_fields: Object.keys(updateData),
          timestamp: new Date().toISOString(),
        },
      });

      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Edit Profile</Text>
          <View style={styles.backButton} />
        </View>

        {/* Non-Editable Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Basic Information</Text>
          <Text style={[styles.sectionNote, { color: colors.textSecondary }]}>
            These fields cannot be edited. Contact admin if changes are needed.
          </Text>

          <View style={[styles.disabledField, { backgroundColor: colors.backgroundElevated }]}>
            <Text style={[styles.disabledLabel, { color: colors.textTertiary }]}>Full Name</Text>
            <Text style={[styles.disabledValue, { color: colors.textSecondary }]}>{profile?.full_name || 'N/A'}</Text>
          </View>
          <View style={[styles.disabledField, { backgroundColor: colors.backgroundElevated }]}>
            <Text style={[styles.disabledLabel, { color: colors.textTertiary }]}>Member ID</Text>
            <Text style={[styles.disabledValue, { color: colors.textSecondary }]}>{profile?.member_id || 'N/A'}</Text>
          </View>
          <View style={[styles.disabledField, { backgroundColor: colors.backgroundElevated }]}>
            <Text style={[styles.disabledLabel, { color: colors.textTertiary }]}>Membership Type</Text>
            <Text style={[styles.disabledValue, { color: colors.textSecondary }]}>{profile?.membership_type || 'N/A'}</Text>
          </View>
          <View style={[styles.disabledField, { backgroundColor: colors.backgroundElevated }]}>
            <Text style={[styles.disabledLabel, { color: colors.textTertiary }]}>Date of Birth</Text>
            <Text style={[styles.disabledValue, { color: colors.textSecondary }]}>{profile?.date_of_birth || 'N/A'}</Text>
          </View>
          <View style={[styles.disabledField, { backgroundColor: colors.backgroundElevated }]}>
            <Text style={[styles.disabledLabel, { color: colors.textTertiary }]}>Gender</Text>
            <Text style={[styles.disabledValue, { color: colors.textSecondary }]}>{profile?.gender || 'N/A'}</Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Contact Information</Text>

          <Input
            label="Mobile Number *"
            value={formData.mobile}
            onChangeText={(value) => updateFormData('mobile', value)}
            placeholder="10-digit mobile number"
            error={errors.mobile}
            keyboardType="phone-pad"
            maxLength={10}
            leftIcon={<Text style={[styles.countryCode, { color: colors.textSecondary }]}>+91</Text>}
          />

          <Input
            label="WhatsApp Number"
            value={formData.whatsapp}
            onChangeText={(value) => updateFormData('whatsapp', value)}
            placeholder="10-digit WhatsApp number"
            error={errors.whatsapp}
            keyboardType="phone-pad"
            maxLength={10}
            leftIcon={<Text style={[styles.countryCode, { color: colors.textSecondary }]}>+91</Text>}
          />

          <Input
            label="Email Address *"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            placeholder="your.email@example.com"
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Address</Text>

          <Input
            label="Address Line 1 *"
            value={formData.addressLine1}
            onChangeText={(value) => updateFormData('addressLine1', value)}
            placeholder="House/Flat No., Building Name"
            error={errors.addressLine1}
            autoCapitalize="words"
          />

          <Input
            label="Address Line 2"
            value={formData.addressLine2}
            onChangeText={(value) => updateFormData('addressLine2', value)}
            placeholder="Street, Locality"
            autoCapitalize="words"
          />

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Input
                label="City *"
                value={formData.city}
                onChangeText={(value) => updateFormData('city', value)}
                placeholder="City"
                error={errors.city}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.rowItem}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>State *</Text>
              <TouchableOpacity
                style={[
                  styles.stateButton,
                  { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
                  errors.state && { borderColor: colors.error }
                ]}
                onPress={() => setShowStatePicker(!showStatePicker)}
              >
                <Text
                  style={[
                    styles.stateText,
                    { color: colors.textPrimary },
                    !formData.state && { color: colors.textTertiary },
                  ]}
                >
                  {formData.state || 'Select'}
                </Text>
                <Icon
                  name={showStatePicker ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
              {errors.state && (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.state}</Text>
              )}
            </View>
          </View>

          {/* State Picker Dropdown */}
          {showStatePicker && (
            <View style={styles.statePickerContainer}>
              <ScrollView
                style={[styles.statePicker, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              >
                {INDIAN_STATES.map((state) => (
                  <TouchableOpacity
                    key={state}
                    style={[
                      styles.stateOption,
                      { borderBottomColor: colors.border },
                      formData.state === state && { backgroundColor: colors.primary + '20' },
                    ]}
                    onPress={() => {
                      updateFormData('state', state);
                      setShowStatePicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.stateOptionText,
                        { color: colors.textPrimary },
                        formData.state === state && { fontWeight: '600', color: colors.primary },
                      ]}
                    >
                      {state}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <Input
            label="PIN Code *"
            value={formData.pinCode}
            onChangeText={(value) => updateFormData('pinCode', value)}
            placeholder="6-digit PIN code"
            error={errors.pinCode}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        {/* Blood Group */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Medical Information</Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Blood Group (Optional)</Text>
            <View style={styles.bloodGroupGrid}>
              {BLOOD_GROUPS.map((bg) => (
                <TouchableOpacity
                  key={bg}
                  style={[
                    styles.bloodGroupButton,
                    { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
                    formData.bloodGroup === bg && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => updateFormData('bloodGroup', bg)}
                >
                  <Text
                    style={[
                      styles.bloodGroupText,
                      { color: colors.textSecondary },
                      formData.bloodGroup === bg && { color: '#FFFFFF' },
                    ]}
                  >
                    {bg}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Emergency Contact</Text>

          <Input
            label="Contact Name"
            value={formData.emergencyName}
            onChangeText={(value) => updateFormData('emergencyName', value)}
            placeholder="Full name"
            autoCapitalize="words"
          />

          <Input
            label="Contact Phone"
            value={formData.emergencyPhone}
            onChangeText={(value) => updateFormData('emergencyPhone', value)}
            placeholder="10-digit mobile number"
            error={errors.emergencyPhone}
            keyboardType="phone-pad"
            maxLength={10}
            leftIcon={<Text style={[styles.countryCode, { color: colors.textSecondary }]}>+91</Text>}
          />

          <Input
            label="Relationship"
            value={formData.emergencyRelation}
            onChangeText={(value) => updateFormData('emergencyRelation', value)}
            placeholder="e.g., Father, Mother, Spouse"
            autoCapitalize="words"
          />
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={loading}
            variant="primary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionNote: {
    fontSize: 13,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  disabledField: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    opacity: 0.6,
  },
  disabledLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  disabledValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  stateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  stateButtonError: {},
  stateText: {
    fontSize: 16,
  },
  statePlaceholder: {},
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  statePickerContainer: {
    marginBottom: 20,
    marginTop: -12,
  },
  statePicker: {
    maxHeight: 200,
    borderRadius: 8,
    borderWidth: 1,
  },
  stateOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  stateOptionSelected: {},
  stateOptionText: {
    fontSize: 14,
  },
  stateOptionTextSelected: {},
  inputContainer: {
    marginBottom: 20,
  },
  bloodGroupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bloodGroupButton: {
    width: '22%',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bloodGroupButtonSelected: {},
  bloodGroupText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bloodGroupTextSelected: {},
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
});
