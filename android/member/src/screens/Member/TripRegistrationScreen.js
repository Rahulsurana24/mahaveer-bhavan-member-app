/**
 * Trip Registration Screen - Register for trips/pilgrimages
 * Handles traveler info, ID proof, medical conditions, payment
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

export default function TripRegistrationScreen({ route, navigation }) {
  const { trip } = route.params;
  const { profile } = useAuth();
  const { colors } = useTheme();

  // Form state
  const [numTravelers, setNumTravelers] = useState(1);
  const [additionalTravelers, setAdditionalTravelers] = useState([]);
  const [dietaryPreferences, setDietaryPreferences] = useState([]);
  const [medicalConditions, setMedicalConditions] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [emergencyContact, setEmergencyContact] = useState({
    name: profile?.emergency_contact?.name || '',
    phone: profile?.emergency_contact?.phone || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('online'); // online, offline, cash
  const [paymentTokenKey, setPaymentTokenKey] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Calculate total fee
   */
  const calculateFee = () => {
    const baseFee = trip.price || 0;
    return baseFee * numTravelers;
  };

  /**
   * Handle number of travelers change
   */
  const handleTravelersChange = (num) => {
    const count = parseInt(num) || 1;
    setNumTravelers(count);

    // Add/remove additional traveler fields
    const newTravelers = [];
    for (let i = 1; i < count; i++) {
      newTravelers.push(
        additionalTravelers[i - 1] || {
          name: '',
          relation: '',
          id_proof_type: 'aadhar',
          id_proof_number: '',
          age: '',
        }
      );
    }
    setAdditionalTravelers(newTravelers);
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
    if (numTravelers < 1) {
      Alert.alert('Error', 'Please select number of travelers');
      return false;
    }

    // Check additional travelers info
    for (let i = 0; i < additionalTravelers.length; i++) {
      const traveler = additionalTravelers[i];

      if (!traveler.name.trim()) {
        Alert.alert('Error', `Please enter name for traveler ${i + 2}`);
        return false;
      }

      if (!traveler.age || isNaN(traveler.age) || traveler.age < 1) {
        Alert.alert('Error', `Please enter valid age for ${traveler.name}`);
        return false;
      }

      if (!traveler.id_proof_number.trim()) {
        Alert.alert('Error', `Please enter ID proof number for ${traveler.name}`);
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

    // Validate token key for cash payment
    if (paymentMethod === 'cash') {
      if (!paymentTokenKey.trim()) {
        Alert.alert('Error', 'Please enter payment token key for cash payment');
        return false;
      }
      if (paymentTokenKey.trim().length < 6) {
        Alert.alert('Error', 'Invalid token key. Please check and try again');
        return false;
      }
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
        trip_id: trip.id,
        member_id: profile.id,
        num_travelers: numTravelers,
        additional_travelers:
          additionalTravelers.length > 0 ? additionalTravelers : null,
        dietary_preferences:
          dietaryPreferences.length > 0 ? dietaryPreferences : null,
        medical_conditions: medicalConditions.trim() || null,
        special_requests: specialRequests.trim() || null,
        emergency_contact: emergencyContact,
        total_fee: totalFee,
        payment_method: paymentMethod,
        payment_token_key: paymentMethod === 'cash' ? paymentTokenKey.trim() : null,
        payment_status: paymentMethod === 'online' ? 'pending' : 'pending',
        status: 'pending', // Will be confirmed after admin verification for cash
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

      // Handle cash payment - pending until admin verifies token
      if (paymentMethod === 'cash') {
        await completeRegistration({
          ...registrationData,
          payment_status: 'pending',
          status: 'pending', // Awaiting admin verification
        });
        return;
      }

      // Complete registration for offline payment
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
        .from('trip_registrations')
        .insert(registrationData)
        .select()
        .single();

      if (error) throw error;

      // Success
      navigation.replace('TripRegistrationSuccess', {
        registration: data,
        trip,
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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Trip Registration</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Trip Info */}
        <View style={[styles.tripInfo, { backgroundColor: colors.backgroundElevated, borderBottomColor: colors.border }]}>
          <Text style={[styles.tripTitle, { color: colors.textPrimary }]}>{trip.title}</Text>
          <Text style={[styles.tripDestination, { color: colors.primary }]}>{trip.destination}</Text>
          <Text style={[styles.tripDates, { color: colors.textSecondary }]}>
            {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
          </Text>
        </View>

        {/* Number of Travelers */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Number of Travelers</Text>
          <View style={styles.travelerSelector}>
            <TouchableOpacity
              style={[styles.travelerButton, { backgroundColor: colors.backgroundElevated, borderColor: colors.primary }]}
              onPress={() => handleTravelersChange(Math.max(1, numTravelers - 1))}
            >
              <Icon name="remove" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.travelerCount, { color: colors.textPrimary }]}>{numTravelers}</Text>
            <TouchableOpacity
              style={[styles.travelerButton, { backgroundColor: colors.backgroundElevated, borderColor: colors.primary }]}
              onPress={() => handleTravelersChange(Math.min(10, numTravelers + 1))}
            >
              <Icon name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Additional Travelers */}
        {additionalTravelers.length > 0 && (
          <View style={[styles.section, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Additional Travelers</Text>
            {additionalTravelers.map((traveler, index) => (
              <View key={index} style={[styles.additionalTraveler, { borderBottomColor: colors.border }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Traveler {index + 2}</Text>

                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundElevated, color: colors.textPrimary, borderColor: colors.border }]}
                  placeholder="Full Name *"
                  placeholderTextColor={colors.textTertiary}
                  value={traveler.name}
                  onChangeText={(text) => {
                    const newTravelers = [...additionalTravelers];
                    newTravelers[index].name = text;
                    setAdditionalTravelers(newTravelers);
                  }}
                />

                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundElevated, color: colors.textPrimary, borderColor: colors.border }]}
                  placeholder="Relation (Optional)"
                  placeholderTextColor={colors.textTertiary}
                  value={traveler.relation}
                  onChangeText={(text) => {
                    const newTravelers = [...additionalTravelers];
                    newTravelers[index].relation = text;
                    setAdditionalTravelers(newTravelers);
                  }}
                />

                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundElevated, color: colors.textPrimary, borderColor: colors.border }]}
                  placeholder="Age *"
                  placeholderTextColor={colors.textTertiary}
                  value={traveler.age}
                  onChangeText={(text) => {
                    const newTravelers = [...additionalTravelers];
                    newTravelers[index].age = text;
                    setAdditionalTravelers(newTravelers);
                  }}
                  keyboardType="numeric"
                  maxLength={3}
                />

                {/* ID Proof Type */}
                <View style={styles.idProofSelector}>
                  {['aadhar', 'passport', 'pan'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.idProofOption,
                        { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
                        traveler.id_proof_type === type && { backgroundColor: colors.primary + '20', borderColor: colors.primary },
                      ]}
                      onPress={() => {
                        const newTravelers = [...additionalTravelers];
                        newTravelers[index].id_proof_type = type;
                        setAdditionalTravelers(newTravelers);
                      }}
                    >
                      <Text
                        style={[
                          styles.idProofOptionText,
                          { color: colors.textSecondary },
                          traveler.id_proof_type === type && { color: colors.primary },
                        ]}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundElevated, color: colors.textPrimary, borderColor: colors.border }]}
                  placeholder={`${traveler.id_proof_type.toUpperCase()} Number *`}
                  placeholderTextColor={colors.textTertiary}
                  value={traveler.id_proof_number}
                  onChangeText={(text) => {
                    const newTravelers = [...additionalTravelers];
                    newTravelers[index].id_proof_number = text;
                    setAdditionalTravelers(newTravelers);
                  }}
                  maxLength={20}
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

        {/* Medical Conditions */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Medical Conditions (Optional)</Text>
          <TextInput
            style={[styles.textarea, { backgroundColor: colors.backgroundElevated, color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="Any medical conditions or allergies we should know about..."
            placeholderTextColor={colors.textTertiary}
            value={medicalConditions}
            onChangeText={setMedicalConditions}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: colors.textTertiary }]}>{medicalConditions.length}/500</Text>
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
            placeholder="Contact Name *"
            placeholderTextColor={colors.textTertiary}
            value={emergencyContact.name}
            onChangeText={(text) =>
              setEmergencyContact({ ...emergencyContact, name: text })
            }
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.backgroundElevated, color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="Contact Phone *"
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
            <View>
              <Text style={[styles.totalFeeLabel, { color: '#FFFFFF' }]}>Total Amount</Text>
              <Text style={[styles.totalFeeBreakdown, { color: '#FFFFFF' }]}>
                ₹{trip.price} × {numTravelers}
              </Text>
            </View>
            <Text style={[styles.totalFeeValue, { color: '#FFFFFF' }]}>₹{totalFee}</Text>
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
                  paymentMethod === 'cash' && { borderColor: colors.primary },
                ]}
                onPress={() => setPaymentMethod('cash')}
              >
                <Icon
                  name={
                    paymentMethod === 'cash'
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  size={24}
                  color={colors.primary}
                />
                <View style={styles.paymentMethodText}>
                  <Text style={[styles.paymentMethodTitle, { color: colors.textPrimary }]}>Cash Payment</Text>
                  <Text style={[styles.paymentMethodSubtitle, { color: colors.textSecondary }]}>
                    Pay cash with admin-generated token key
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Token Key Input for Cash Payment */}
          {paymentMethod === 'cash' && (
            <View style={styles.tokenKeySection}>
              <Text style={[styles.tokenKeyLabel, { color: colors.textPrimary }]}>
                Payment Token Key *
              </Text>
              <Text style={[styles.tokenKeySubtext, { color: colors.textSecondary }]}>
                Enter the token key provided by admin after cash payment
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.backgroundElevated, color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="Enter token key"
                placeholderTextColor={colors.textTertiary}
                value={paymentTokenKey}
                onChangeText={setPaymentTokenKey}
                autoCapitalize="characters"
                maxLength={20}
              />
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
              I agree to the terms and conditions and cancellation policy
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <SafeAreaView style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]} edges={['bottom']}>
        <Button
          title={`Confirm Registration - ₹${totalFee}`}
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
  tripInfo: {
    padding: 16,
    borderBottomWidth: 1,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  tripDestination: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  tripDates: {
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
  travelerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  travelerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  travelerCount: {
    fontSize: 32,
    fontWeight: '700',
  },
  additionalTraveler: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
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
  idProofSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  idProofOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  idProofOptionText: {
    fontSize: 13,
    fontWeight: '600',
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
    flex: 1,
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
    marginBottom: 4,
  },
  totalFeeBreakdown: {
    fontSize: 12,
    opacity: 0.8,
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
  tokenKeySection: {
    marginTop: 16,
  },
  tokenKeyLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  tokenKeySubtext: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
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
