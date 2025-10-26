/**
 * Event Detail Screen - View event details and register
 * Shows event info, pricing, description, and registration options
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import { supabase } from '../../services/supabase/client';

export default function EventDetailScreen({ route, navigation }) {
  const { eventId } = route.params;
  const { profile } = useAuth();
  const { colors } = useTheme();
  const [event, setEvent] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDescription, setExpandedDescription] = useState(false);

  useEffect(() => {
    loadEventDetails();
    checkRegistration();
  }, [eventId]);

  /**
   * Load event details
   */
  const loadEventDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          registrations:event_registrations(count)
        `)
        .eq('id', eventId)
        .single();

      if (error) throw error;

      setEvent(data);
    } catch (error) {
      console.error('Error loading event:', error);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if user is registered
   */
  const checkRegistration = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('member_id', profile?.id)
        .single();

      if (!error && data) {
        setRegistration(data);
      }
    } catch (error) {
      // Not registered, that's fine
    }
  };

  /**
   * Handle register button
   */
  const handleRegister = () => {
    navigation.navigate('EventRegistration', { event });
  };

  /**
   * Handle share button
   */
  const handleShare = () => {
    Alert.alert('Share Event', 'Share feature coming soon');
  };

  /**
   * Open location in maps
   */
  const openLocation = () => {
    if (event?.location) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        event.location
      )}`;
      Linking.openURL(url);
    }
  };

  /**
   * Format date
   */
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  /**
   * Format time
   */
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  /**
   * Get user's applicable fee
   */
  const getUserFee = () => {
    if (!event || !profile) return event?.base_fee || 0;

    // If event has dynamic pricing (fees JSONB field)
    if (event.fees && typeof event.fees === 'object') {
      const membershipType = profile.membership_type;
      return event.fees[membershipType] || event.base_fee || 0;
    }

    return event.base_fee || 0;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>Event not found</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="secondary"
          />
        </View>
      </SafeAreaView>
    );
  }

  const userFee = getUserFee();
  const isUpcoming = new Date(event.start_date) >= new Date();
  const isFull = event.capacity && event.registrations?.[0]?.count >= event.capacity;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {event.image_url ? (
            <Image source={{ uri: event.image_url }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder, { backgroundColor: colors.backgroundElevated }]}>
              <Icon name="calendar-outline" size={64} color={colors.textTertiary} />
            </View>
          )}

          {/* Overlay gradient */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.heroGradient}
          />

          {/* Back and Share buttons */}
          <SafeAreaView style={styles.heroButtons} edges={['top']}>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroButton} onPress={handleShare}>
              <Icon name="share-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>{event.title}</Text>

          {/* Status Badge */}
          {registration && (
            <View style={[styles.registeredBadge, { backgroundColor: colors.success + '20' }]}>
              <Icon name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.registeredBadgeText, { color: colors.success }]}>You're Registered</Text>
            </View>
          )}

          {/* Event Info */}
          <View style={styles.infoSection}>
            {/* Date */}
            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <View style={styles.infoIcon}>
                <Icon name="calendar-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.infoText}>
                <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Date</Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                  {formatDate(event.start_date)}
                  {event.end_date &&
                    event.end_date !== event.start_date &&
                    ` - ${formatDate(event.end_date)}`}
                </Text>
              </View>
            </View>

            {/* Time */}
            {event.start_time && (
              <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                <View style={styles.infoIcon}>
                  <Icon name="time-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.infoText}>
                  <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Time</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                    {formatTime(event.start_time)}
                    {event.end_time && ` - ${formatTime(event.end_time)}`}
                  </Text>
                </View>
              </View>
            )}

            {/* Location */}
            {event.location && (
              <TouchableOpacity style={[styles.infoRow, { borderBottomColor: colors.border }]} onPress={openLocation}>
                <View style={styles.infoIcon}>
                  <Icon name="location-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.infoText}>
                  <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Location</Text>
                  <Text style={[styles.infoValue, styles.infoValueLink, { color: colors.primary }]}>
                    {event.location}
                  </Text>
                </View>
                <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            )}

            {/* Organizer */}
            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <View style={styles.infoIcon}>
                <Icon name="people-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.infoText}>
                <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Organized by</Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>Mahaveer Seva Trust</Text>
              </View>
            </View>

            {/* Capacity */}
            {event.capacity && (
              <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                <View style={styles.infoIcon}>
                  <Icon name="person-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.infoText}>
                  <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Registrations</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                    {event.registrations?.[0]?.count || 0} / {event.capacity}
                    {isFull && ' (Full)'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Description Section */}
          {event.description && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>About This Event</Text>
              <Text
                style={[styles.description, { color: colors.textSecondary }]}
                numberOfLines={expandedDescription ? undefined : 4}
              >
                {event.description}
              </Text>
              {event.description.length > 150 && (
                <TouchableOpacity
                  onPress={() => setExpandedDescription(!expandedDescription)}
                >
                  <Text style={[styles.readMore, { color: colors.primary }]}>
                    {expandedDescription ? 'Read less' : 'Read more'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Pricing Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Registration Fee</Text>
            <View style={[styles.pricingCard, { backgroundColor: colors.backgroundElevated }]}>
              <Text style={[styles.pricingLabel, { color: colors.textSecondary }]}>Your fee ({profile?.membership_type})</Text>
              <Text style={[styles.pricingValue, { color: colors.primary }]}>
                {userFee > 0 ? `₹${userFee}` : 'Free'}
              </Text>
            </View>

            {/* Show all pricing tiers if available */}
            {event.fees && typeof event.fees === 'object' && (
              <View style={[styles.pricingTable, { backgroundColor: colors.backgroundElevated }]}>
                <Text style={[styles.pricingTableTitle, { color: colors.textSecondary }]}>Fee Structure</Text>
                {Object.entries(event.fees).map(([type, fee]) => (
                  <View key={type} style={[styles.pricingTableRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.pricingTableType, { color: colors.textPrimary }]}>{type}</Text>
                    <Text style={[styles.pricingTableFee, { color: colors.textPrimary }]}>
                      {fee > 0 ? `₹${fee}` : 'Free'}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Logistics Section (if registered) */}
          {registration && registration.status === 'confirmed' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Your Registration Details</Text>
              <View style={[styles.logisticsCard, { backgroundColor: colors.backgroundElevated }]}>
                <View style={styles.logisticsRow}>
                  <Text style={[styles.logisticsLabel, { color: colors.textSecondary }]}>Status</Text>
                  <View style={[styles.statusBadgeSmall, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.statusBadgeSmallText, { color: colors.success }]}>
                      {registration.status}
                    </Text>
                  </View>
                </View>
                {registration.payment_status && (
                  <View style={styles.logisticsRow}>
                    <Text style={[styles.logisticsLabel, { color: colors.textSecondary }]}>Payment</Text>
                    <Text style={[styles.logisticsValue, { color: colors.textPrimary }]}>
                      {registration.payment_status}
                    </Text>
                  </View>
                )}
                <View style={styles.logisticsRow}>
                  <Text style={[styles.logisticsLabel, { color: colors.textSecondary }]}>Registered On</Text>
                  <Text style={[styles.logisticsValue, { color: colors.textPrimary }]}>
                    {new Date(registration.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {isUpcoming && (
        <SafeAreaView style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]} edges={['bottom']}>
          {registration ? (
            <Button
              title="View Registration"
              onPress={() =>
                navigation.navigate('RegistrationDetails', {
                  registrationId: registration.id,
                })
              }
              variant="secondary"
              style={styles.actionButton}
            />
          ) : (
            <Button
              title={isFull ? 'Event Full' : 'Register Now'}
              onPress={handleRegister}
              disabled={isFull}
              variant="primary"
              style={styles.actionButton}
            />
          )}
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 300,
  },
  heroPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  heroButtons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  heroButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16,
  },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
    gap: 6,
  },
  registeredBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoIcon: {
    width: 40,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  infoValueLink: {},
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  readMore: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  pricingCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pricingLabel: {
    fontSize: 15,
  },
  pricingValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  pricingTable: {
    borderRadius: 12,
    padding: 16,
  },
  pricingTableTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  pricingTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  pricingTableType: {
    fontSize: 14,
  },
  pricingTableFee: {
    fontSize: 14,
    fontWeight: '600',
  },
  logisticsCard: {
    borderRadius: 12,
    padding: 16,
  },
  logisticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  logisticsLabel: {
    fontSize: 14,
  },
  logisticsValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadgeSmall: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeSmallText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    width: '100%',
  },
});
