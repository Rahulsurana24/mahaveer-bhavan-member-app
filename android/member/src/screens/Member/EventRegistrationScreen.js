/**
 * Event Registration Screen - Register for events
 * Handles attendee info, dietary preferences, payment
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import colors from '../../constants/colors';
import { supabase } from '../../services/supabase';

export default function EventRegistrationScreen({ route, navigation }) {
  const { event } = route.params;
  const { profile } = useAuth();

  // Form state
  const [numAttendees, setNumAttendees] = useState(1);
  const [additionalAttendees, setAdditionalAttendees] = useState([]);
  const [dietaryPreferences, setDietaryPreferences] = useState([]);
  const [specialRequests, setSpecialRequests] = useState('');
  const [emergencyContact, setEmergencyContact] = useState({
    name: profile?.emergency_contact?.name || '',
    phone: profile?.emergency_contact?.phone || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('online'); // online, offline, pay_at_event
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Calculate total fee
   */
  const calculateFee = () => {
    let baseFee = 0;

    // Get user's membership type fee
    if (event.fees && typeof event.fees === 'object') {
      baseFee = event.fees[profile?.membership_type] || event.base_fee || 0;
    } else {
      baseFee = event.base_fee || 0;
    }

    return baseFee * numAttendees;
  };

  /**
   * Handle number of attendees change
   */
  const handleAttendeesChange = (num) => {
    const count = parseInt(num) || 1;
    setNumAttendees(count);

    // Add/remove additional attendee fields
    const newAttendees = [];
    for (let i = 1; i < count; i++) {
      newAttendees.push(
        additionalAttendees[i - 1] || { name: '', relation: '' }
      );
    }
    setAdditionalAttendees(newAttendees);
  };

  /**
   * Toggle dietary preference
   */
  const toggleDietaryPreference = (pref) => {
    if (dietaryPreferences.includes(pref)) {
      setDietaryPreferences(dietaryPreferences.filter((p) => p !== pref));
    } else {
      setDietaryPreferences([...dietaryPreferences, pref]);
    }
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    if (numAttendees < 1) {
      Alert.alert('Error', 'Please select number of attendees');
      return false;
    }

    // Check additional attendees names
    for (let i = 0; i < additionalAttendees.length; i++) {
      if (!additionalAttendees[i].name.trim()) {
        Alert.alert('Error', `Please enter name for attendee ${i + 2}`);
        return false;
      }
    }

    if (!emergencyContact.name.trim()) {
      Alert.alert('Error', 'Please enter emergency contact name');
      return false;
    }

    if (!emergencyContact.phone.trim() || emergencyContact.phone.length < 10) {
      Alert.alert('Error', 'Please enter valid emergency contact phone');
      return false;
    }

    if (!agreedToTerms) {
      Alert.alert('Error', 'Please agree to terms and conditions');
      return false;
    }

    return true;
  };

  /**
   * Handle registration submission
   */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const totalFee = calculateFee();

      // Prepare registration data
      const registrationData = {
        event_id: event.id,
        member_id: profile.id,
        num_attendees: numAttendees,
        additional_attendees:
          additionalAttendees.length > 0 ? additionalAttendees : null,
        dietary_preferences:
          dietaryPreferences.length > 0 ? dietaryPreferences : null,
        special_requests: specialRequests.trim() || null,
        emergency_contact: emergencyContact,
        total_fee: totalFee,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'online' ? 'pending' : 'pending',
        status: 'pending',
      };

      // Handle online payment
      if (paymentMethod === 'online' && totalFee > 0) {
        // TODO: Integrate Razorpay
        Alert.alert(
          'Payment Integration',
          'Razorpay integration coming soon. Proceeding with registration.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await completeRegistration({
                  ...registrationData,
                  payment_status: 'completed',
                  status: 'confirmed',
                });
              },
            },
          ]
        );
        return;
      }

      // Complete registration for offline/pay_at_event
      await completeRegistration({
        ...registrationData,
        status: 'confirmed',
      });
    } catch (error) {
      console.error('Error submitting registration:', error);
      Alert.alert('Error', 'Failed to submit registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Complete registration
   */
  const completeRegistration = async (registrationData) => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .insert(registrationData)
        .select()
        .single();

      if (error) throw error;

      // Success
      navigation.replace('RegistrationSuccess', {
        registration: data,
        event,
      });
    } catch (error) {
      console.error('Error completing registration:', error);
      throw error;
    }
  };

  const totalFee = calculateFee();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Registration</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Event Info */}
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDate}>
            {new Date(event.start_date).toLocaleDateString()}
          </Text>
        </View>

        {/* Number of Attendees */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Attendees</Text>
          <View style={styles.attendeeSelector}>
            <TouchableOpacity
              style={styles.attendeeButton}
              onPress={() => handleAttendeesChange(Math.max(1, numAttendees - 1))}
            >
              <Icon name="remove" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.attendeeCount}>{numAttendees}</Text>
            <TouchableOpacity
              style={styles.attendeeButton}
              onPress={() => handleAttendeesChange(Math.min(10, numAttendees + 1))}
            >
              <Icon name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Additional Attendees */}
        {additionalAttendees.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Attendees</Text>
            {additionalAttendees.map((attendee, index) => (
              <View key={index} style={styles.additionalAttendee}>
                <Text style={styles.label}>Attendee {index + 2}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor={colors.textTertiary}
                  value={attendee.name}
                  onChangeText={(text) => {
                    const newAttendees = [...additionalAttendees];
                    newAttendees[index].name = text;
                    setAdditionalAttendees(newAttendees);
                  }}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Relation (Optional)"
                  placeholderTextColor={colors.textTertiary}
                  value={attendee.relation}
                  onChangeText={(text) => {
                    const newAttendees = [...additionalAttendees];
                    newAttendees[index].relation = text;
                    setAdditionalAttendees(newAttendees);
                  }}
                />
              </View>
            ))}
          </View>
        )}

        {/* Dietary Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Preferences</Text>
          <View style={styles.checkboxGroup}>
            {['Vegetarian', 'Vegan', 'Jain', 'Gluten-free', 'None'].map((pref) => (
              <TouchableOpacity
                key={pref}
                style={styles.checkbox}
                onPress={() => toggleDietaryPreference(pref)}
              >
                <Icon
                  name={
                    dietaryPreferences.includes(pref)
                      ? 'checkbox'
                      : 'square-outline'
                  }
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.checkboxLabel}>{pref}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Special Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Requests (Optional)</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Any special requirements or comments..."
            placeholderTextColor={colors.textTertiary}
            value={specialRequests}
            onChangeText={setSpecialRequests}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{specialRequests.length}/500</Text>
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <TextInput
            style={styles.input}
            placeholder="Contact Name"
            placeholderTextColor={colors.textTertiary}
            value={emergencyContact.name}
            onChangeText={(text) =>
              setEmergencyContact({ ...emergencyContact, name: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Contact Phone"
            placeholderTextColor={colors.textTertiary}
            value={emergencyContact.phone}
            onChangeText={(text) =>
              setEmergencyContact({ ...emergencyContact, phone: text })
            }
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        {/* Payment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>

          {/* Total Fee */}
          <View style={styles.totalFeeCard}>
            <Text style={styles.totalFeeLabel}>Total Amount</Text>
            <Text style={styles.totalFeeValue}>
              {totalFee > 0 ? `₹${totalFee}` : 'Free'}
            </Text>
          </View>

          {/* Payment Methods */}
          {totalFee > 0 && (
            <View style={styles.paymentMethods}>
              <TouchableOpacity
                style={[
                  styles.paymentMethod,
                  paymentMethod === 'online' && styles.paymentMethodActive,
                ]}
                onPress={() => setPaymentMethod('online')}
              >
                <Icon
                  name={
                    paymentMethod === 'online'
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  size={24}
                  color={colors.primary}
                />
                <View style={styles.paymentMethodText}>
                  <Text style={styles.paymentMethodTitle}>Online Payment</Text>
                  <Text style={styles.paymentMethodSubtitle}>
                    Pay via Razorpay (Cards, UPI, Wallet)
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentMethod,
                  paymentMethod === 'offline' && styles.paymentMethodActive,
                ]}
                onPress={() => setPaymentMethod('offline')}
              >
                <Icon
                  name={
                    paymentMethod === 'offline'
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  size={24}
                  color={colors.primary}
                />
                <View style={styles.paymentMethodText}>
                  <Text style={styles.paymentMethodTitle}>Bank Transfer</Text>
                  <Text style={styles.paymentMethodSubtitle}>
                    Transfer to our account (details will be sent)
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentMethod,
                  paymentMethod === 'pay_at_event' && styles.paymentMethodActive,
                ]}
                onPress={() => setPaymentMethod('pay_at_event')}
              >
                <Icon
                  name={
                    paymentMethod === 'pay_at_event'
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  size={24}
                  color={colors.primary}
                />
                <View style={styles.paymentMethodText}>
                  <Text style={styles.paymentMethodTitle}>Pay at Event</Text>
                  <Text style={styles.paymentMethodSubtitle}>
                    Pay cash at the event venue
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Terms and Conditions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
          >
            <Icon
              name={agreedToTerms ? 'checkbox' : 'square-outline'}
              size={24}
              color={colors.primary}
            />
            <Text style={styles.checkboxLabel}>
              I agree to the terms and conditions
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <SafeAreaView style={styles.footer} edges={['bottom']}>
        <Button
          title={`Confirm Registration${totalFee > 0 ? ` - ₹${totalFee}` : ''}`}
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
          variant="primary"
          style={styles.submitButton}
        />
      </SafeAreaView>
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  eventInfo: {
    padding: 16,
    backgroundColor: colors.backgroundElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  attendeeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  attendeeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  attendeeCount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  additionalAttendee: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textarea: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  charCount: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: 4,
  },
  checkboxGroup: {
    gap: 12,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxLabel: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  totalFeeCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalFeeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  totalFeeValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentMethodActive: {
    borderColor: colors.primary,
  },
  paymentMethodText: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  paymentMethodSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    width: '100%',
  },
});
