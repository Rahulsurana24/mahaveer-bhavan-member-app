/**
 * Step 3: Membership Details
 * Collects: Membership Type, Emergency Contact
 */

import React from 'react';
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

const MEMBERSHIP_TYPES = [
  {
    type: 'Tapasvi',
    description: 'Ascetic practitioners',
    color: '#F59E0B',
    icon: 'flower-outline',
  },
  {
    type: 'Karyakarta',
    description: 'Active volunteers',
    color: '#8B5CF6',
    icon: 'hand-left-outline',
  },
  {
    type: 'Shraman',
    description: 'Monks and nuns',
    color: '#3B82F6',
    icon: 'accessibility-outline',
  },
  {
    type: 'Shravak',
    description: 'Devoted followers',
    color: '#10B981',
    icon: 'heart-outline',
  },
  {
    type: 'General Member',
    description: 'Community members',
    color: '#6B7280',
    icon: 'people-outline',
  },
  {
    type: 'Trustee',
    description: 'Board members',
    color: '#0F766E',
    icon: 'shield-checkmark-outline',
  },
  {
    type: 'Labharti',
    description: 'Beneficiaries',
    color: '#EC4899',
    icon: 'gift-outline',
  },
];

const RELATIONS = [
  'Father', 'Mother', 'Spouse', 'Son', 'Daughter',
  'Brother', 'Sister', 'Friend', 'Other',
];

export default function Step3MembershipDetails({ formData, updateFormData, errors }) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Membership Details</Text>
      <Text style={styles.stepSubtitle}>
        Choose your membership type and provide emergency contact
      </Text>

      {/* Membership Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Membership Type <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.membershipGrid}>
          {MEMBERSHIP_TYPES.map((membership) => (
            <TouchableOpacity
              key={membership.type}
              style={[
                styles.membershipCard,
                formData.membershipType === membership.type && styles.membershipCardSelected,
                { borderColor: membership.color },
              ]}
              onPress={() => updateFormData('membershipType', membership.type)}
            >
              <View
                style={[
                  styles.membershipIcon,
                  { backgroundColor: membership.color + '20' },
                ]}
              >
                <Icon name={membership.icon} size={24} color={membership.color} />
              </View>
              <Text style={styles.membershipType}>{membership.type}</Text>
              <Text style={styles.membershipDescription}>
                {membership.description}
              </Text>
              {formData.membershipType === membership.type && (
                <View style={[styles.checkmark, { backgroundColor: membership.color }]}>
                  <Icon name="checkmark" size={16} color={colors.textPrimary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
        {errors.membershipType && (
          <Text style={styles.errorText}>{errors.membershipType}</Text>
        )}
      </View>

      {/* Emergency Contact Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Contact</Text>
        <Text style={styles.sectionSubtitle}>
          Person to contact in case of emergency
        </Text>

        {/* Emergency Contact Name */}
        <Input
          label="Contact Name"
          value={formData.emergencyContactName}
          onChangeText={(value) => updateFormData('emergencyContactName', value)}
          placeholder="Full name of emergency contact"
          error={errors.emergencyContactName}
          autoCapitalize="words"
        />

        {/* Emergency Contact Number */}
        <Input
          label="Contact Number"
          value={formData.emergencyContactNumber}
          onChangeText={(value) => updateFormData('emergencyContactNumber', value)}
          placeholder="10-digit mobile number"
          error={errors.emergencyContactNumber}
          keyboardType="phone-pad"
          maxLength={10}
          leftIcon={
            <Text style={styles.countryCode}>+91</Text>
          }
        />

        {/* Relationship */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Relationship <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.relationGrid}>
            {RELATIONS.map((relation) => (
              <TouchableOpacity
                key={relation}
                style={[
                  styles.relationButton,
                  formData.emergencyRelation === relation && styles.relationButtonSelected,
                ]}
                onPress={() => updateFormData('emergencyRelation', relation)}
              >
                <Text
                  style={[
                    styles.relationText,
                    formData.emergencyRelation === relation && styles.relationTextSelected,
                  ]}
                >
                  {relation}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.emergencyRelation && (
            <Text style={styles.errorText}>{errors.emergencyRelation}</Text>
          )}
        </View>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Icon name="information-circle-outline" size={20} color={colors.primary} />
        <Text style={styles.infoText}>
          Your emergency contact will only be contacted in case of emergencies during events or activities.
        </Text>
      </View>
    </ScrollView>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  required: {
    color: colors.error,
  },
  membershipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  membershipCard: {
    width: '48%',
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  membershipCardSelected: {
    borderWidth: 2,
    backgroundColor: colors.backgroundElevated,
  },
  membershipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  membershipType: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  membershipDescription: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 8,
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
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginRight: 8,
  },
  relationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relationButton: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  relationButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  relationText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  relationTextSelected: {
    color: colors.textPrimary,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
    padding: 12,
    gap: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
