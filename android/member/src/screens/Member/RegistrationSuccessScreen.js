/**
 * Registration Success Screen - Event registration confirmation
 * Displays QR code for event entry and registration details
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
import { generateEventQRData } from '../../utils/qrCode';

export default function RegistrationSuccessScreen({ route, navigation }) {
  const { registration, event } = route.params;

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
  const qrData = generateEventQRData({
    id: registration.id,
    event_id: event.id,
    member_id: registration.member_id,
  });

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /**
   * Format time for display
   */
  const formatTime = (timeString) => {
    if (!timeString) return 'TBD';

    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;

    return `${hour12}:${minutes} ${ampm}`;
  };

  /**
   * Get payment method display text
   */
  const getPaymentMethodText = () => {
    switch (registration.payment_method) {
      case 'online':
        return 'Online Payment';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'pay_at_event':
        return 'Pay at Event';
      default:
        return registration.payment_method || 'N/A';
    }
  };

  /**
   * Navigate back to events list
   */
  const handleBackToEvents = () => {
    // Navigate to Events tab
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
        <Text style={styles.successTitle}>Registration Successful!</Text>
        <Text style={styles.successSubtitle}>
          You're all set for this event
        </Text>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>Your Entry QR Code</Text>
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
            Show this QR code at the event entrance
          </Text>
          <View style={styles.registrationIdBox}>
            <Text style={styles.registrationIdLabel}>Registration ID</Text>
            <Text style={styles.registrationId}>
              {registration.id.split('-')[0].toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Event Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Icon name="calendar-outline" size={20} color={colors.primary} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Event</Text>
                <Text style={styles.detailValue}>{event.title}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Icon name="time-outline" size={20} color={colors.primary} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>
                  {formatDate(event.start_date)}
                </Text>
                <Text style={styles.detailValue}>
                  {formatTime(event.start_time)}
                </Text>
              </View>
            </View>

            {event.location && (
              <View style={styles.detailRow}>
                <Icon name="location-outline" size={20} color={colors.primary} />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{event.location}</Text>
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
                <Text style={styles.detailLabel}>Number of Attendees</Text>
                <Text style={styles.detailValue}>
                  {registration.num_attendees || 1}
                  {registration.num_attendees > 1 ? ' people' : ' person'}
                </Text>
              </View>
            </View>

            {registration.additional_attendees &&
              registration.additional_attendees.length > 0 && (
                <View style={styles.detailRow}>
                  <Icon name="person-add-outline" size={20} color={colors.primary} />
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Additional Attendees</Text>
                    {registration.additional_attendees.map((attendee, index) => (
                      <Text key={index} style={styles.detailValue}>
                        {attendee.name} ({attendee.relation})
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
                  {registration.total_fee > 0 ? `₹${registration.total_fee}` : 'Free'}
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
                    : 'Pay at Event'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Additional Info */}
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
            A confirmation email has been sent to your registered email address.
            You can also view this registration in the Events section.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.footer}>
        <Button
          title="Back to Events"
          onPress={handleBackToEvents}
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
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
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
