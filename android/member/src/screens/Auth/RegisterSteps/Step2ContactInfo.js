/**
 * Step 2: Contact Information
 * Collects: Mobile, WhatsApp, Email, Address
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import Input from '../../../components/common/Input';
import colors from '../../../constants/colors';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

export default function Step2ContactInfo({ formData, updateFormData, errors }) {
  const [showStatePicker, setShowStatePicker] = useState(false);

  /**
   * Handle same as mobile checkbox
   */
  const handleSameAsMobile = (value) => {
    updateFormData('sameAsMobile', value);
    if (value) {
      updateFormData('whatsapp', formData.mobile);
    } else {
      updateFormData('whatsapp', '');
    }
  };

  /**
   * Handle mobile number change
   */
  const handleMobileChange = (value) => {
    updateFormData('mobile', value);
    if (formData.sameAsMobile) {
      updateFormData('whatsapp', value);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Contact Information</Text>
      <Text style={styles.stepSubtitle}>
        How can we reach you?
      </Text>

      {/* Mobile Number */}
      <Input
        label="Mobile Number"
        value={formData.mobile}
        onChangeText={handleMobileChange}
        placeholder="10-digit mobile number"
        error={errors.mobile}
        keyboardType="phone-pad"
        maxLength={10}
        leftIcon={
          <Text style={styles.countryCode}>+91</Text>
        }
      />

      {/* WhatsApp Number */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => handleSameAsMobile(!formData.sameAsMobile)}
        >
          <View style={[
            styles.checkbox,
            formData.sameAsMobile && styles.checkboxChecked,
          ]}>
            {formData.sameAsMobile && (
              <Icon name="checkmark" size={16} color={colors.textPrimary} />
            )}
          </View>
          <Text style={styles.checkboxLabel}>
            WhatsApp number is same as mobile
          </Text>
        </TouchableOpacity>

        {!formData.sameAsMobile && (
          <Input
            label="WhatsApp Number (Optional)"
            value={formData.whatsapp}
            onChangeText={(value) => updateFormData('whatsapp', value)}
            placeholder="10-digit WhatsApp number"
            error={errors.whatsapp}
            keyboardType="phone-pad"
            maxLength={10}
            leftIcon={
              <Text style={styles.countryCode}>+91</Text>
            }
          />
        )}
      </View>

      {/* Email */}
      <Input
        label="Email Address"
        value={formData.email}
        onChangeText={(value) => updateFormData('email', value)}
        placeholder="your.email@example.com"
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Address Line 1 */}
      <Input
        label="Address Line 1"
        value={formData.addressLine1}
        onChangeText={(value) => updateFormData('addressLine1', value)}
        placeholder="House/Flat No., Building Name"
        error={errors.addressLine1}
        autoCapitalize="words"
      />

      {/* Address Line 2 */}
      <Input
        label="Address Line 2 (Optional)"
        value={formData.addressLine2}
        onChangeText={(value) => updateFormData('addressLine2', value)}
        placeholder="Street, Locality"
        autoCapitalize="words"
      />

      {/* City and State Row */}
      <View style={styles.row}>
        <View style={styles.rowItem}>
          <Input
            label="City"
            value={formData.city}
            onChangeText={(value) => updateFormData('city', value)}
            placeholder="City"
            error={errors.city}
            autoCapitalize="words"
          />
        </View>
        <View style={styles.rowItem}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              State <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.stateButton,
                errors.state && styles.stateButtonError,
              ]}
              onPress={() => setShowStatePicker(!showStatePicker)}
            >
              <Text
                style={[
                  styles.stateText,
                  !formData.state && styles.statePlaceholder,
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
              <Text style={styles.errorText}>{errors.state}</Text>
            )}
          </View>
        </View>
      </View>

      {/* State Picker Dropdown */}
      {showStatePicker && (
        <View style={styles.statePickerContainer}>
          <ScrollView
            style={styles.statePicker}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            {INDIAN_STATES.map((state) => (
              <TouchableOpacity
                key={state}
                style={[
                  styles.stateOption,
                  formData.state === state && styles.stateOptionSelected,
                ]}
                onPress={() => {
                  updateFormData('state', state);
                  setShowStatePicker(false);
                }}
              >
                <Text
                  style={[
                    styles.stateOptionText,
                    formData.state === state && styles.stateOptionTextSelected,
                  ]}
                >
                  {state}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* PIN Code */}
      <Input
        label="PIN Code"
        value={formData.pinCode}
        onChangeText={(value) => updateFormData('pinCode', value)}
        placeholder="6-digit PIN code"
        error={errors.pinCode}
        keyboardType="number-pad"
        maxLength={6}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  required: {
    color: colors.error,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginRight: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  stateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  stateButtonError: {
    borderColor: colors.error,
  },
  stateText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  statePlaceholder: {
    color: colors.textTertiary,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  statePickerContainer: {
    marginBottom: 20,
    marginTop: -12,
  },
  statePicker: {
    maxHeight: 200,
    backgroundColor: colors.backgroundElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stateOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stateOptionSelected: {
    backgroundColor: colors.primary + '20',
  },
  stateOptionText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  stateOptionTextSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
});
