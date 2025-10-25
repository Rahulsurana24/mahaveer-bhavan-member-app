/**
 * Trip Registration Success Screen - Trip registration confirmation
 * Displays QR code for trip entry, registration details, and logistics if available
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg';
import Button from '../../components/common/Button';
import colors from '../../constants/colors';
import { generateTripQRData } from '../../utils/qrCode';

export default function TripRegistrationSuccessScreen({ route, navigation }) {
  const { registration, trip, assignment } = route.params;

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;

  /**
   * Success animation on mount
   */
  useEffect(() => {
    // Animate checkmark
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(checkmarkAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  /**
   * Generate QR code data
   */
  const qrData = generateTripQRData({
    id: registration.id,
    trip_id: trip.id,
    member_id: registration.member_id,
  });

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  /**
   * Get payment method display text
   */
  const getPaymentMethodText = () => {
    switch (registration.payment_method) {
      case 'online':
        return 'Online Payment';
      case 'offline':
        return 'Bank Transfer';
      case 'cash':
        return 'Cash Payment';
      default:
        return registration.payment_method || 'N/A';
    }
  };

  /**
   * Navigate back to events/trips list
   */
  const handleBackToTrips = () => {
    // Navigate to Events tab (which has Trips tab inside)
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp', params: { screen: 'Events' } }],
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Success Animation */}
        <View style={styles.animationContainer}>
          <Animated.View
            style={[
              styles.checkmarkCircle,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Animated.View
              style={{
                opacity: checkmarkAnim,
                transform: [
                  {
                    scale: checkmarkAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
              }}
            >
              <Icon name="checkmark" size={64} color={colors.textPrimary} />
            </Animated.View>
          </Animated.View>
        </View>

        {/* Success Message */}
        <Text style={styles.successTitle}>Registration Confirmed!</Text>
        <Text style={styles.successSubtitle}>
          Your pilgrimage journey awaits
        </Text>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>Your Trip QR Code</Text>
          <View style={styles.qrContainer}>
            <QRCode
              value={qrData}
              size={200}
              color="#000000"
              backgroundColor="#FFFFFF"
              quietZone={10}
              ecl="M"
            />
          </View>
          <Text style={styles.qrSubtext}>
            Show this QR code for attendance and boarding
          </Text>
          <View style={styles.registrationIdBox}>
            <Text style={styles.registrationIdLabel}>Registration ID</Text>
            <Text style={styles.registrationId}>
              {registration.id.split('-')[0].toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Trip Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Details</Text>
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Icon name="location-outline" size={20} color={colors.primary} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Trip</Text>
                <Text style={styles.detailValue}>{trip.title}</Text>
                <Text style={styles.detailSubvalue}>{trip.destination}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Icon name="calendar-outline" size={20} color={colors.primary} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Travel Dates</Text>
                <Text style={styles.detailValue}>
                  {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                </Text>
              </View>
            </View>

            {trip.transport_type && (
              <View style={styles.detailRow}>
                <Icon name="bus-outline" size={20} color={colors.primary} />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Transportation</Text>
                  <Text style={styles.detailValue}>{trip.transport_type}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Registration Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registration Details</Text>
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Icon name="people-outline" size={20} color={colors.primary} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Number of Travelers</Text>
                <Text style={styles.detailValue}>
                  {registration.num_travelers || 1}
                  {registration.num_travelers > 1 ? ' people' : ' person'}
                </Text>
              </View>
            </View>

            {registration.additional_travelers &&
              registration.additional_travelers.length > 0 && (
                <View style={styles.detailRow}>
                  <Icon name="person-add-outline" size={20} color={colors.primary} />
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Additional Travelers</Text>
                    {registration.additional_travelers.map((traveler, index) => (
                      <Text key={index} style={styles.detailValue}>
                        {traveler.name} ({traveler.age} yrs{traveler.relation ? `, ${traveler.relation}` : ''})
                      </Text>
                    ))}
                  </View>
                </View>
              )}

            <View style={styles.detailRow}>
              <Icon name="card-outline" size={20} color={colors.primary} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Payment Method</Text>
                <Text style={styles.detailValue}>
                  {getPaymentMethodText()}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Icon name="cash-outline" size={20} color={colors.primary} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Total Amount</Text>
                <Text style={[styles.detailValue, styles.amountText]}>
                  ₹{registration.total_fee}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Icon
                name={
                  registration.payment_status === 'completed'
                    ? 'checkmark-circle'
                    : 'time-outline'
                }
                size={20}
                color={
                  registration.payment_status === 'completed'
                    ? colors.success
                    : colors.warning
                }
              />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Payment Status</Text>
                <Text
                  style={[
                    styles.detailValue,
                    {
                      color:
                        registration.payment_status === 'completed'
                          ? colors.success
                          : colors.warning,
                    },
                  ]}
                >
                  {registration.payment_status === 'completed'
                    ? 'Paid'
                    : registration.payment_status === 'pending'
                    ? 'Pending'
                    : registration.payment_status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Travel Logistics (only shown after confirmation) */}
        {assignment && registration.status === 'confirmed' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Travel Logistics</Text>
            <View style={styles.card}>
              {assignment.room_number && (
                <View style={styles.detailRow}>
                  <Icon name="bed-outline" size={20} color={colors.primary} />
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Room Number</Text>
                    <Text style={styles.detailValue}>{assignment.room_number}</Text>
                  </View>
                </View>
              )}
              {assignment.train_seat_number && (
                <View style={styles.detailRow}>
                  <Icon name="train-outline" size={20} color={colors.primary} />
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Train Seat</Text>
                    <Text style={styles.detailValue}>
                      {assignment.train_seat_number}
                    </Text>
                  </View>
                </View>
              )}
              {assignment.bus_seat_number && (
                <View style={styles.detailRow}>
                  <Icon name="bus-outline" size={20} color={colors.primary} />
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Bus Seat</Text>
                    <Text style={styles.detailValue}>
                      {assignment.bus_seat_number}
                    </Text>
                  </View>
                </View>
              )}
              {assignment.flight_ticket_number && (
                <View style={styles.detailRow}>
                  <Icon name="airplane-outline" size={20} color={colors.primary} />
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Flight Ticket</Text>
                    <Text style={styles.detailValue}>
                      {assignment.flight_ticket_number}
                    </Text>
                  </View>
                </View>
              )}
              {assignment.pnr_number && (
                <View style={styles.detailRow}>
                  <Icon name="receipt-outline" size={20} color={colors.primary} />
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>PNR Number</Text>
                    <Text style={styles.detailValue}>{assignment.pnr_number}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Medical Conditions */}
        {registration.medical_conditions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medical Information</Text>
            <View style={styles.card}>
              <Text style={styles.medicalText}>
                {registration.medical_conditions}
              </Text>
            </View>
          </View>
        )}

        {/* Special Requests */}
        {registration.special_requests && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Requests</Text>
            <View style={styles.card}>
              <Text style={styles.specialRequestsText}>
                {registration.special_requests}
              </Text>
            </View>
          </View>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Icon name="information-circle-outline" size={20} color={colors.info} />
          <Text style={styles.infoText}>
            {registration.status === 'confirmed'
              ? `A confirmation email with trip details and itinerary has been sent to your registered email address.${
                  !assignment
                    ? ' Travel logistics will be assigned closer to the departure date.'
                    : ''
                }`
              : registration.payment_method === 'cash'
              ? 'Your registration is pending admin verification of the payment token key. You will receive a confirmation email once verified. Room assignments will be provided after confirmation.'
              : 'Your registration is being processed. You will receive a confirmation email once approved. Room assignments will be provided after confirmation.'}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.footer}>
        <Button
          title="Back to Trips"
          onPress={handleBackToTrips}
          variant="primary"
          style={styles.backButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  animationContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  checkmarkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  qrContainer: {
    backgroundColor: colors.textPrimary,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  qrSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  registrationIdBox: {
    backgroundColor: colors.backgroundElevated,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  registrationIdLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 4,
  },
  registrationId: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailText: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  detailSubvalue: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 2,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  medicalText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  specialRequestsText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.info + '20',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  backButton: {
    width: '100%',
  },
});
