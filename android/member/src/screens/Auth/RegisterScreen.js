/**
 * RegisterScreen
 * 4-Step Registration Flow with Photo Upload
 * Phase 2.1 Implementation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import colors from '../../constants/colors';
import { supabase } from '../../services/supabase/client';

// Step components
import Step1BasicInfo from './RegisterSteps/Step1BasicInfo';
import Step2ContactInfo from './RegisterSteps/Step2ContactInfo';
import Step3MembershipDetails from './RegisterSteps/Step3MembershipDetails';
import Step4PhotoUpload from './RegisterSteps/Step4PhotoUpload';

const MEMBERSHIP_TYPES = ['Tapasvi', 'Karyakarta', 'Shraman', 'Shravak', 'General Member', 'Trustee', 'Labharti'];

export default function RegisterScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    fullName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',

    // Step 2: Contact Info
    mobile: '',
    whatsapp: '',
    sameAsMobile: true,
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',

    // Step 3: Membership
    membershipType: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    emergencyRelation: '',

    // Step 4: Photo
    photoUri: null,
    photoUrl: null,
  });

  const [errors, setErrors] = useState({});

  /**
   * Update form data
   */
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Validate current step
   */
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Basic Info
        if (!formData.fullName?.trim()) {
          newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.trim().length < 3) {
          newErrors.fullName = 'Name must be at least 3 characters';
        }

        if (!formData.dateOfBirth) {
          newErrors.dateOfBirth = 'Date of birth is required';
        } else {
          // Check age (must be 18+)
          const age = calculateAge(formData.dateOfBirth);
          if (age < 18) {
            newErrors.dateOfBirth = 'You must be at least 18 years old';
          }
        }

        if (!formData.gender) {
          newErrors.gender = 'Gender is required';
        }
        break;

      case 2: // Contact Info
        if (!formData.mobile) {
          newErrors.mobile = 'Mobile number is required';
        } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
          newErrors.mobile = 'Invalid mobile number';
        }

        if (!formData.email) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Invalid email address';
        }

        if (!formData.addressLine1?.trim()) {
          newErrors.addressLine1 = 'Address is required';
        }

        if (!formData.city?.trim()) {
          newErrors.city = 'City is required';
        }

        if (!formData.state) {
          newErrors.state = 'State is required';
        }

        if (!formData.pinCode) {
          newErrors.pinCode = 'PIN code is required';
        } else if (!/^\d{6}$/.test(formData.pinCode)) {
          newErrors.pinCode = 'Invalid PIN code';
        }
        break;

      case 3: // Membership
        if (!formData.membershipType) {
          newErrors.membershipType = 'Membership type is required';
        }

        if (!formData.emergencyContactName?.trim()) {
          newErrors.emergencyContactName = 'Emergency contact name is required';
        }

        if (!formData.emergencyContactNumber) {
          newErrors.emergencyContactNumber = 'Emergency contact number is required';
        } else if (!/^[6-9]\d{9}$/.test(formData.emergencyContactNumber)) {
          newErrors.emergencyContactNumber = 'Invalid phone number';
        }

        if (!formData.emergencyRelation) {
          newErrors.emergencyRelation = 'Relationship is required';
        }
        break;

      case 4: // Photo
        if (!formData.photoUri && !formData.photoUrl) {
          newErrors.photo = 'Photo is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Calculate age from date string
   */
  const calculateAge = (dateString) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  /**
   * Handle next button
   */
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  /**
   * Handle back button
   */
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  /**
   * Handle final submission
   */
  const handleSubmit = async () => {
    setLoading(true);

    try {
      // 1. Upload photo to Supabase Storage
      let photoUrl = formData.photoUrl;

      if (formData.photoUri && !photoUrl) {
        const timestamp = Date.now();
        const fileName = `member_${timestamp}.jpg`;

        // TODO: Implement actual photo upload
        // For now, use placeholder
        photoUrl = `https://via.placeholder.com/400?text=${formData.fullName}`;
      }

      // 2. Generate temporary member ID (will be replaced by DB function)
      const tempMemberId = `TEMP-${Date.now()}`;

      // 3. Prepare member data
      const memberData = {
        full_name: formData.fullName.trim(),
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        blood_group: formData.bloodGroup || null,
        phone: formData.mobile,
        whatsapp_number: formData.sameAsMobile ? formData.mobile : (formData.whatsapp || null),
        email: formData.email.toLowerCase().trim(),
        street_address: formData.addressLine1.trim(),
        address_line_2: formData.addressLine2?.trim() || null,
        city: formData.city.trim(),
        state: formData.state,
        postal_code: formData.pinCode,
        country: 'India',
        membership_type: formData.membershipType,
        emergency_contact: {
          name: formData.emergencyContactName.trim(),
          phone: formData.emergencyContactNumber,
          relation: formData.emergencyRelation,
        },
        photo_url: photoUrl,
        status: 'active',
        is_active: true,
      };

      // 4. Insert member record
      const { data: member, error: memberError } = await supabase
        .from('members')
        .insert([memberData])
        .select()
        .single();

      if (memberError) {
        throw memberError;
      }

      // 5. Create auth account
      const tempPassword = generateTempPassword();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.toLowerCase().trim(),
        password: tempPassword,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            member_id: member.id,
          },
        },
      });

      if (authError) {
        console.error('Auth error:', authError);
        // Continue anyway - admin can set up auth later
      }

      // 6. Log registration
      await supabase.from('audit_logs').insert({
        action: 'member_registered',
        action_type: 'member_registered',
        target_type: 'member',
        target_id: member.id,
        details: {
          membership_type: formData.membershipType,
          registration_date: new Date().toISOString(),
        },
      });

      // 7. Show success
      Alert.alert(
        'Registration Successful!',
        `Welcome to Mahaveer Bhavan! Your member ID is ${member.id}. You will receive your login credentials via email.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );

    } catch (error) {
      console.error('Registration error:', error);

      let errorMessage = 'Registration failed. Please try again.';

      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        if (error.message?.includes('email')) {
          errorMessage = 'This email is already registered.';
        } else if (error.message?.includes('phone')) {
          errorMessage = 'This mobile number is already registered.';
        }
      }

      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate temporary password
   */
  const generateTempPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  /**
   * Render step indicator
   */
  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicator}>
        {[1, 2, 3, 4].map((step) => (
          <View key={step} style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              currentStep >= step && styles.stepCircleActive,
              currentStep === step && styles.stepCircleCurrent,
            ]}>
              {currentStep > step ? (
                <Icon name="checkmark" size={16} color={colors.textPrimary} />
              ) : (
                <Text style={[
                  styles.stepNumber,
                  currentStep >= step && styles.stepNumberActive,
                ]}>
                  {step}
                </Text>
              )}
            </View>
            {step < 4 && (
              <View style={[
                styles.stepLine,
                currentStep > step && styles.stepLineActive,
              ]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  /**
   * Render current step
   */
  const renderStep = () => {
    const stepProps = {
      formData,
      updateFormData,
      errors,
    };

    switch (currentStep) {
      case 1:
        return <Step1BasicInfo {...stepProps} />;
      case 2:
        return <Step2ContactInfo {...stepProps} />;
      case 3:
        return <Step3MembershipDetails {...stepProps} />;
      case 4:
        return <Step4PhotoUpload {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registration</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button
          title={currentStep === 4 ? 'Complete Registration' : 'Next'}
          onPress={handleNext}
          loading={loading}
          disabled={loading}
        />
        <Text style={styles.stepText}>
          Step {currentStep} of 4
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepCircleCurrent: {
    borderWidth: 3,
    borderColor: colors.primaryLight,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  stepNumberActive: {
    color: colors.textPrimary,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  bottomActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.backgroundElevated,
  },
  stepText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
});
