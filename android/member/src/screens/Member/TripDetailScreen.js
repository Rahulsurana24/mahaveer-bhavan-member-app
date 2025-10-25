/**
 * Trip Detail Screen - View trip/pilgrimage details and register
 * Shows trip info, itinerary, documents, logistics for registered users
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
import Button from '../../components/common/Button';
import colors from '../../constants/colors';
import { supabase } from '../../services/supabase';

export default function TripDetailScreen({ route, navigation }) {
  const { tripId } = route.params;
  const { profile } = useAuth();
  const [trip, setTrip] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [expandedItinerary, setExpandedItinerary] = useState(false);

  useEffect(() => {
    loadTripDetails();
    checkRegistration();
    loadDocuments();
  }, [tripId]);

  /**
   * Load trip details
   */
  const loadTripDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          registrations:trip_registrations(count)
        `)
        .eq('id', tripId)
        .single();

      if (error) throw error;

      setTrip(data);
    } catch (error) {
      console.error('Error loading trip:', error);
      Alert.alert('Error', 'Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if user is registered and load assignment
   */
  const checkRegistration = async () => {
    try {
      // Check registration
      const { data: regData, error: regError } = await supabase
        .from('trip_registrations')
        .select('*')
        .eq('trip_id', tripId)
        .eq('member_id', profile?.id)
        .single();

      if (!regError && regData) {
        setRegistration(regData);

        // Load assignment if confirmed
        if (regData.status === 'confirmed') {
          const { data: assignData, error: assignError } = await supabase
            .from('trip_assignments')
            .select('*')
            .eq('trip_id', tripId)
            .eq('member_id', profile?.id)
            .single();

          if (!assignError && assignData) {
            setAssignment(assignData);
          }
        }
      }
    } catch (error) {
      // Not registered, that's fine
    }
  };

  /**
   * Load trip documents
   */
  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('trip_documents')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  /**
   * Handle register button
   */
  const handleRegister = () => {
    navigation.navigate('TripRegistration', { trip });
  };

  /**
   * Handle share button
   */
  const handleShare = () => {
    Alert.alert('Share Trip', 'Share feature coming soon');
  };

  /**
   * Open document
   */
  const openDocument = (doc) => {
    if (doc.file_url) {
      Linking.openURL(doc.file_url);
    }
  };

  /**
   * Format date
   */
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  /**
   * Format date range
   */
  const formatDateRange = () => {
    if (!trip) return '';
    const start = formatDate(trip.start_date);
    const end = formatDate(trip.end_date);
    return `${start} - ${end}`;
  };

  /**
   * Calculate trip duration
   */
  const getTripDuration = () => {
    if (!trip) return '';
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} ${days === 1 ? 'Day' : 'Days'}`;
  };

  /**
   * Get transport icon
   */
  const getTransportIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'bus':
        return 'bus-outline';
      case 'train':
        return 'train-outline';
      case 'flight':
        return 'airplane-outline';
      case 'car':
        return 'car-outline';
      default:
        return 'navigate-outline';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>Trip not found</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="secondary"
          />
        </View>
      </SafeAreaView>
    );
  }

  const isUpcoming = new Date(trip.start_date) >= new Date();
  const isFull = trip.capacity && trip.registrations?.[0]?.count >= trip.capacity;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {trip.image_url ? (
            <Image source={{ uri: trip.image_url }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Icon name="location-outline" size={64} color={colors.textTertiary} />
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
              <Icon name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroButton} onPress={handleShare}>
              <Icon name="share-outline" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>{trip.title}</Text>
          <Text style={styles.destination}>{trip.destination}</Text>

          {/* Status Badge */}
          {registration && (
            <View style={styles.registeredBadge}>
              <Icon name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.registeredBadgeText}>You're Registered</Text>
            </View>
          )}

          {/* Trip Info */}
          <View style={styles.infoSection}>
            {/* Dates */}
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="calendar-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Travel Dates</Text>
                <Text style={styles.infoValue}>{formatDateRange()}</Text>
                <Text style={styles.infoSubvalue}>({getTripDuration()})</Text>
              </View>
            </View>

            {/* Transport */}
            {trip.transport_type && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon
                    name={getTransportIcon(trip.transport_type)}
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Transportation</Text>
                  <Text style={styles.infoValue}>{trip.transport_type}</Text>
                </View>
              </View>
            )}

            {/* Target Audience */}
            {trip.target_audience && trip.target_audience.length > 0 && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name="people-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Suitable For</Text>
                  <Text style={styles.infoValue}>
                    {trip.target_audience.join(', ')}
                  </Text>
                </View>
              </View>
            )}

            {/* Organizer */}
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="briefcase-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Organized by</Text>
                <Text style={styles.infoValue}>Mahaveer Seva Trust</Text>
              </View>
            </View>

            {/* Capacity */}
            {trip.capacity && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name="person-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Registrations</Text>
                  <Text style={styles.infoValue}>
                    {trip.registrations?.[0]?.count || 0} / {trip.capacity}
                    {isFull && ' (Full)'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Description Section */}
          {trip.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About This Trip</Text>
              <Text
                style={styles.description}
                numberOfLines={expandedDescription ? undefined : 4}
              >
                {trip.description}
              </Text>
              {trip.description.length > 150 && (
                <TouchableOpacity
                  onPress={() => setExpandedDescription(!expandedDescription)}
                >
                  <Text style={styles.readMore}>
                    {expandedDescription ? 'Read less' : 'Read more'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Itinerary Section */}
          {trip.itinerary && Array.isArray(trip.itinerary) && trip.itinerary.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Itinerary</Text>
              <View style={styles.itineraryContainer}>
                {(expandedItinerary ? trip.itinerary : trip.itinerary.slice(0, 3)).map(
                  (item, index) => (
                    <View key={index} style={styles.itineraryItem}>
                      <View style={styles.itineraryDay}>
                        <Text style={styles.itineraryDayText}>Day {item.day || index + 1}</Text>
                      </View>
                      <View style={styles.itineraryContent}>
                        {item.title && (
                          <Text style={styles.itineraryTitle}>{item.title}</Text>
                        )}
                        {item.activities && (
                          <Text style={styles.itineraryActivities}>{item.activities}</Text>
                        )}
                        {item.description && (
                          <Text style={styles.itineraryDescription}>
                            {item.description}
                          </Text>
                        )}
                      </View>
                    </View>
                  )
                )}
                {trip.itinerary.length > 3 && (
                  <TouchableOpacity
                    onPress={() => setExpandedItinerary(!expandedItinerary)}
                  >
                    <Text style={styles.readMore}>
                      {expandedItinerary ? 'Show less' : `View all ${trip.itinerary.length} days`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Documents Section */}
          {documents.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Documents & Information</Text>
              {documents.map((doc) => (
                <TouchableOpacity
                  key={doc.id}
                  style={styles.documentItem}
                  onPress={() => openDocument(doc)}
                >
                  <Icon name="document-text-outline" size={24} color={colors.primary} />
                  <View style={styles.documentText}>
                    <Text style={styles.documentTitle}>{doc.title}</Text>
                    {doc.file_type && (
                      <Text style={styles.documentType}>{doc.file_type}</Text>
                    )}
                  </View>
                  <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Pricing Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trip Cost</Text>
            <View style={styles.pricingCard}>
              <Text style={styles.pricingLabel}>Price per person</Text>
              <Text style={styles.pricingValue}>
                {trip.price > 0 ? `₹${trip.price}` : 'Free'}
              </Text>
            </View>
            {trip.price_includes && (
              <View style={styles.includesContainer}>
                <Text style={styles.includesTitle}>Includes:</Text>
                <Text style={styles.includesText}>{trip.price_includes}</Text>
              </View>
            )}
          </View>

          {/* Logistics Section (if registered and confirmed) */}
          {registration && registration.status === 'confirmed' && assignment && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Travel Details</Text>
              <View style={styles.logisticsCard}>
                {assignment.room_number && (
                  <View style={styles.logisticsRow}>
                    <Icon name="bed-outline" size={20} color={colors.primary} />
                    <View style={styles.logisticsText}>
                      <Text style={styles.logisticsLabel}>Room</Text>
                      <Text style={styles.logisticsValue}>{assignment.room_number}</Text>
                    </View>
                  </View>
                )}
                {assignment.train_seat_number && (
                  <View style={styles.logisticsRow}>
                    <Icon name="train-outline" size={20} color={colors.primary} />
                    <View style={styles.logisticsText}>
                      <Text style={styles.logisticsLabel}>Train Seat</Text>
                      <Text style={styles.logisticsValue}>
                        {assignment.train_seat_number}
                      </Text>
                    </View>
                  </View>
                )}
                {assignment.bus_seat_number && (
                  <View style={styles.logisticsRow}>
                    <Icon name="bus-outline" size={20} color={colors.primary} />
                    <View style={styles.logisticsText}>
                      <Text style={styles.logisticsLabel}>Bus Seat</Text>
                      <Text style={styles.logisticsValue}>
                        {assignment.bus_seat_number}
                      </Text>
                    </View>
                  </View>
                )}
                {assignment.flight_ticket_number && (
                  <View style={styles.logisticsRow}>
                    <Icon name="airplane-outline" size={20} color={colors.primary} />
                    <View style={styles.logisticsText}>
                      <Text style={styles.logisticsLabel}>Flight Ticket</Text>
                      <Text style={styles.logisticsValue}>
                        {assignment.flight_ticket_number}
                      </Text>
                    </View>
                  </View>
                )}
                {assignment.pnr_number && (
                  <View style={styles.logisticsRow}>
                    <Icon name="receipt-outline" size={20} color={colors.primary} />
                    <View style={styles.logisticsText}>
                      <Text style={styles.logisticsLabel}>PNR Number</Text>
                      <Text style={styles.logisticsValue}>{assignment.pnr_number}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Registration Status (if registered) */}
          {registration && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Registration Status</Text>
              <View style={styles.logisticsCard}>
                <View style={styles.logisticsRow}>
                  <Icon
                    name={
                      registration.status === 'confirmed'
                        ? 'checkmark-circle'
                        : 'time-outline'
                    }
                    size={20}
                    color={
                      registration.status === 'confirmed'
                        ? colors.success
                        : colors.warning
                    }
                  />
                  <View style={styles.logisticsText}>
                    <Text style={styles.logisticsLabel}>Status</Text>
                    <Text
                      style={[
                        styles.logisticsValue,
                        {
                          color:
                            registration.status === 'confirmed'
                              ? colors.success
                              : colors.warning,
                        },
                      ]}
                    >
                      {registration.status}
                    </Text>
                  </View>
                </View>
                {registration.payment_status && (
                  <View style={styles.logisticsRow}>
                    <Icon name="card-outline" size={20} color={colors.primary} />
                    <View style={styles.logisticsText}>
                      <Text style={styles.logisticsLabel}>Payment</Text>
                      <Text style={styles.logisticsValue}>
                        {registration.payment_status}
                      </Text>
                    </View>
                  </View>
                )}
                <View style={styles.logisticsRow}>
                  <Icon name="calendar-outline" size={20} color={colors.primary} />
                  <View style={styles.logisticsText}>
                    <Text style={styles.logisticsLabel}>Registered On</Text>
                    <Text style={styles.logisticsValue}>
                      {new Date(registration.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {isUpcoming && (
        <SafeAreaView style={styles.footer} edges={['bottom']}>
          {registration ? (
            <Button
              title="View Registration"
              onPress={() =>
                navigation.navigate('TripRegistrationSuccess', {
                  registration,
                  trip,
                  assignment,
                })
              }
              variant="secondary"
              style={styles.actionButton}
            />
          ) : (
            <Button
              title={isFull ? 'Trip Full' : 'Register Now'}
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
    backgroundColor: colors.background,
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
    color: colors.textSecondary,
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
    backgroundColor: colors.backgroundSecondary,
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
    color: colors.textPrimary,
    marginBottom: 4,
  },
  destination: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.primary,
    marginBottom: 16,
  },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
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
    color: colors.success,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    color: colors.textTertiary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  infoSubvalue: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  readMore: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 8,
  },
  itineraryContainer: {
    gap: 16,
  },
  itineraryItem: {
    flexDirection: 'row',
    gap: 12,
  },
  itineraryDay: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itineraryDayText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  itineraryContent: {
    flex: 1,
  },
  itineraryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  itineraryActivities: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginBottom: 4,
  },
  itineraryDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  documentText: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  documentType: {
    fontSize: 12,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  pricingCard: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pricingLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  pricingValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  includesContainer: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 12,
    padding: 16,
  },
  includesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  includesText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  logisticsCard: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  logisticsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logisticsText: {
    flex: 1,
  },
  logisticsLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  logisticsValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    width: '100%',
  },
});
