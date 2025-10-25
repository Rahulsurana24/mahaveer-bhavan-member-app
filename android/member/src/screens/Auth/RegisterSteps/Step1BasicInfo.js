/**
 * Step 1: Basic Information
 * Collects: Full Name, Date of Birth, Gender, Blood Group
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';

import Input from '../../../components/common/Input';
import colors from '../../../constants/colors';

const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Step1BasicInfo({ formData, updateFormData, errors }) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  /**
   * Handle date selection
   */
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');

    if (selectedDate) {
      // Format as YYYY-MM-DD
      const formatted = selectedDate.toISOString().split('T')[0];
      updateFormData('dateOfBirth', formatted);
    }
  };

  /**
   * Format date for display
   */
  const getDateDisplay = () => {
    if (!formData.dateOfBirth) return '';
    const date = new Date(formData.dateOfBirth);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  /**
   * Get maximum date (18 years ago)
   */
  const getMaxDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>
        Let's start with your basic details
      </Text>

      {/* Full Name */}
      <Input
        label="Full Name"
        value={formData.fullName}
        onChangeText={(value) => updateFormData('fullName', value)}
        placeholder="Enter your full name"
        error={errors.fullName}
        autoCapitalize="words"
        autoCorrect={false}
      />

      {/* Date of Birth */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          Date of Birth <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={[
            styles.dateButton,
            errors.dateOfBirth && styles.dateButtonError,
          ]}
          onPress={() => setShowDatePicker(true)}
        >
          <Icon
            name="calendar-outline"
            size={20}
            color={formData.dateOfBirth ? colors.textPrimary : colors.textTertiary}
          />
          <Text
            style={[
              styles.dateText,
              !formData.dateOfBirth && styles.datePlaceholder,
            ]}
          >
            {formData.dateOfBirth ? getDateDisplay() : 'Select date of birth'}
          </Text>
        </TouchableOpacity>
        {errors.dateOfBirth && (
          <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
        )}
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : getMaxDate()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={getMaxDate()}
          minimumDate={new Date(1940, 0, 1)}
        />
      )}

      {/* Gender */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          Gender <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.buttonGroup}>
          {GENDERS.map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.optionButton,
                formData.gender === gender && styles.optionButtonSelected,
              ]}
              onPress={() => updateFormData('gender', gender)}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.gender === gender && styles.optionTextSelected,
                ]}
              >
                {gender}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.gender && (
          <Text style={styles.errorText}>{errors.gender}</Text>
        )}
      </View>

      {/* Blood Group */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Blood Group (Optional)</Text>
        <View style={styles.bloodGroupGrid}>
          {BLOOD_GROUPS.map((bloodGroup) => (
            <TouchableOpacity
              key={bloodGroup}
              style={[
                styles.bloodGroupButton,
                formData.bloodGroup === bloodGroup && styles.bloodGroupButtonSelected,
              ]}
              onPress={() => updateFormData('bloodGroup', bloodGroup)}
            >
              <Text
                style={[
                  styles.bloodGroupText,
                  formData.bloodGroup === bloodGroup && styles.bloodGroupTextSelected,
                ]}
              >
                {bloodGroup}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  dateButtonError: {
    borderColor: colors.error,
  },
  dateText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  datePlaceholder: {
    color: colors.textTertiary,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  optionTextSelected: {
    color: colors.textPrimary,
  },
  bloodGroupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bloodGroupButton: {
    width: '22%',
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bloodGroupButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  bloodGroupText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  bloodGroupTextSelected: {
    color: colors.textPrimary,
  },
});
