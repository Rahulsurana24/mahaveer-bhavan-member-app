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
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import { supabase } from '../../services/supabase/client';

export default function EventRegistrationScreen({ route, navigation }) {
  const { event } = route.params;
  const { profile } = useAuth();
  const { colors } = useTheme();

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Event Registration</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Event Info */}
        <View style={[styles.eventInfo, { backgroundColor: colors.backgroundElevated, borderBottomColor: colors.border }]}>
          <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>{event.title}</Text>
          <Text style={[styles.eventDate, { color: colors.textSecondary }]}>
            {new Date(event.start_date).toLocaleDateString()}
          </Text>
        </View>

        {/* Number of Attendees */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Number of Attendees</Text>
          <View style={styles.attendeeSelector}>
            <TouchableOpacity
              style={[styles.attendeeButton, { backgroundColor: colors.backgroundElevated, borderColor: colors.primary }]}
              onPress={() => handleAttendeesChange(Math.max(1, numAttendees - 1))}
            >
              <Icon name="remove" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.attendeeCount, { color: colors.textPrimary }]}>{numAttendees}</Text>
            <TouchableOpacity
              style={[styles.attendeeButton, { backgroundColor: colors.backgroundElevated, borderColor: colors.primary }]}
              onPress={() => handleAttendeesChange(Math.min(10, numAttendees + 1))}
            >
              <Icon name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Additional Attendees */}
        {additionalAttendees.length > 0 && (
          <View style={[styles.section, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Additional Attendees</Text>
            {additionalAttendees.map((attendee, index) => (
              <View key={index} style={styles.additionalAttendee}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Attendee {index + 2}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundElevated, color: colors.textPrimary, borderColor: colors.border }]}
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
                  style={[styles.input, { backgroundColor: colors.backgroundElevated, color: colors.textPrimary, borderColor: colors.border }]}
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
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Dietary Preferences</Text>
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
                <Text style={[styles.checkboxLabel, { color: colors.textPrimary }]}>{pref}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Special Requests */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Special Requests (Optional)</Text>
          <TextInput
            style={[styles.textarea, { backgroundColor: colors.backgroundElevated, color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="Any special requirements or comments..."
            placeholderTextColor={colors.textTertiary}
            value={specialRequests}
            onChangeText={setSpecialRequests}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: colors.textTertiary }]}>{specialRequests.length}/500</Text>
        </View>

        {/* Emergency Contact */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Emergency Contact</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.backgroundElevated, color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="Contact Name"
            placeholderTextColor={colors.textTertiary}
            value={emergencyContact.name}
            onChangeText={(text) =>
              setEmergencyContact({ ...emergencyContact, name: text })
            }
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.backgroundElevated, color: colors.textPrimary, borderColor: colors.border }]}
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
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Payment</Text>

          {/* Total Fee */}
          <View style={[styles.totalFeeCard, { backgroundColor: colors.primary }]}>
            <Text style={[styles.totalFeeLabel, { color: '#FFFFFF' }]}>Total Amount</Text>
            <Text style={[styles.totalFeeValue, { color: '#FFFFFF' }]}>
              {totalFee > 0 ? `₹${totalFee}` : 'Free'}
            </Text>
          </View>

          {/* Payment Methods */}
          {totalFee > 0 && (
            <View style={styles.paymentMethods}>
              <TouchableOpacity
                style={[
                  styles.paymentMethod,
                  { backgroundColor: colors.backgroundElevated },
                  paymentMethod === 'online' && { borderColor: colors.primary },
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
                  <Text style={[styles.paymentMethodTitle, { color: colors.textPrimary }]}>Online Payment</Text>
                  <Text style={[styles.paymentMethodSubtitle, { color: colors.textSecondary }]}>
                    Pay via Razorpay (Cards, UPI, Wallet)
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentMethod,
                  { backgroundColor: colors.backgroundElevated },
                  paymentMethod === 'offline' && { borderColor: colors.primary },
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
                  <Text style={[styles.paymentMethodTitle, { color: colors.textPrimary }]}>Bank Transfer</Text>
                  <Text style={[styles.paymentMethodSubtitle, { color: colors.textSecondary }]}>
                    Transfer to our account (details will be sent)
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentMethod,
                  { backgroundColor: colors.backgroundElevated },
                  paymentMethod === 'pay_at_event' && { borderColor: colors.primary },
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
                  <Text style={[styles.paymentMethodTitle, { color: colors.textPrimary }]}>Pay at Event</Text>
                  <Text style={[styles.paymentMethodSubtitle, { color: colors.textSecondary }]}>
                    Pay cash at the event venue
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Terms and Conditions */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
          >
            <Icon
              name={agreedToTerms ? 'checkbox' : 'square-outline'}
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.checkboxLabel, { color: colors.textPrimary }]}>
              I agree to the terms and conditions
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <SafeAreaView style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]} edges={['bottom']}>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
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
  scrollView: {
    flex: 1,
  },
  eventInfo: {
    padding: 16,
    borderBottomWidth: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  attendeeCount: {
    fontSize: 32,
    fontWeight: '700',
  },
  additionalAttendee: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
  },
  textarea: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 100,
    borderWidth: 1,
  },
  charCount: {
    fontSize: 12,
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
  },
  totalFeeCard: {
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
  },
  totalFeeValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentMethodActive: {},
  paymentMethodText: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentMethodSubtitle: {
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  submitButton: {
    width: '100%',
  },
});
