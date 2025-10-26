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
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import { supabase } from '../../services/supabase/client';

export default function TripDetailScreen({ route, navigation }) {
  const { tripId } = route.params;
  const { profile } = useAuth();
  const { colors } = useTheme();
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>Trip not found</Text>
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {trip.image_url ? (
            <Image source={{ uri: trip.image_url }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder, { backgroundColor: colors.backgroundElevated }]}>
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
          <Text style={[styles.title, { color: colors.textPrimary }]}>{trip.title}</Text>
          <Text style={[styles.destination, { color: colors.primary }]}>{trip.destination}</Text>

          {/* Status Badge */}
          {registration && (
            <View style={[styles.registeredBadge, { backgroundColor: colors.success + '20' }]}>
              <Icon name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.registeredBadgeText, { color: colors.success }]}>You're Registered</Text>
            </View>
          )}

          {/* Trip Info */}
          <View style={styles.infoSection}>
            {/* Dates */}
            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <View style={styles.infoIcon}>
                <Icon name="calendar-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.infoText}>
                <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Travel Dates</Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{formatDateRange()}</Text>
                <Text style={[styles.infoSubvalue, { color: colors.textSecondary }]}>({getTripDuration()})</Text>
              </View>
            </View>

            {/* Transport */}
            {trip.transport_type && (
              <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                <View style={styles.infoIcon}>
                  <Icon
                    name={getTransportIcon(trip.transport_type)}
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.infoText}>
                  <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Transportation</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{trip.transport_type}</Text>
                </View>
              </View>
            )}

            {/* Target Audience */}
            {trip.target_audience && trip.target_audience.length > 0 && (
              <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                <View style={styles.infoIcon}>
                  <Icon name="people-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.infoText}>
                  <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Suitable For</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                    {trip.target_audience.join(', ')}
                  </Text>
                </View>
              </View>
            )}

            {/* Organizer */}
            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <View style={styles.infoIcon}>
                <Icon name="briefcase-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.infoText}>
                <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Organized by</Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>Mahaveer Seva Trust</Text>
              </View>
            </View>

            {/* Capacity */}
            {trip.capacity && (
              <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                <View style={styles.infoIcon}>
                  <Icon name="person-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.infoText}>
                  <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Registrations</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
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
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>About This Trip</Text>
              <Text
                style={[styles.description, { color: colors.textSecondary }]}
                numberOfLines={expandedDescription ? undefined : 4}
              >
                {trip.description}
              </Text>
              {trip.description.length > 150 && (
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

          {/* Itinerary Section */}
          {trip.itinerary && Array.isArray(trip.itinerary) && trip.itinerary.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Itinerary</Text>
              <View style={styles.itineraryContainer}>
                {(expandedItinerary ? trip.itinerary : trip.itinerary.slice(0, 3)).map(
                  (item, index) => (
                    <View key={index} style={styles.itineraryItem}>
                      <View style={[styles.itineraryDay, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.itineraryDayText, { color: '#FFFFFF' }]}>Day {item.day || index + 1}</Text>
                      </View>
                      <View style={styles.itineraryContent}>
                        {item.title && (
                          <Text style={[styles.itineraryTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                        )}
                        {item.activities && (
                          <Text style={[styles.itineraryActivities, { color: colors.primary }]}>{item.activities}</Text>
                        )}
                        {item.description && (
                          <Text style={[styles.itineraryDescription, { color: colors.textSecondary }]}>
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
                    <Text style={[styles.readMore, { color: colors.primary }]}>
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
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Documents & Information</Text>
              {documents.map((doc) => (
                <TouchableOpacity
                  key={doc.id}
                  style={[styles.documentItem, { backgroundColor: colors.backgroundElevated }]}
                  onPress={() => openDocument(doc)}
                >
                  <Icon name="document-text-outline" size={24} color={colors.primary} />
                  <View style={styles.documentText}>
                    <Text style={[styles.documentTitle, { color: colors.textPrimary }]}>{doc.title}</Text>
                    {doc.file_type && (
                      <Text style={[styles.documentType, { color: colors.textTertiary }]}>{doc.file_type}</Text>
                    )}
                  </View>
                  <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Pricing Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Trip Cost</Text>
            <View style={[styles.pricingCard, { backgroundColor: colors.backgroundElevated }]}>
              <Text style={[styles.pricingLabel, { color: colors.textSecondary }]}>Price per person</Text>
              <Text style={[styles.pricingValue, { color: colors.primary }]}>
                {trip.price > 0 ? `₹${trip.price}` : 'Free'}
              </Text>
            </View>
            {trip.price_includes && (
              <View style={[styles.includesContainer, { backgroundColor: colors.backgroundElevated }]}>
                <Text style={[styles.includesTitle, { color: colors.textSecondary }]}>Includes:</Text>
                <Text style={[styles.includesText, { color: colors.textPrimary }]}>{trip.price_includes}</Text>
              </View>
            )}
          </View>

          {/* Logistics Section (if registered and confirmed) */}
          {registration && registration.status === 'confirmed' && assignment && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Your Travel Details</Text>
              <View style={[styles.logisticsCard, { backgroundColor: colors.backgroundElevated }]}>
                {assignment.room_number && (
                  <View style={styles.logisticsRow}>
                    <Icon name="bed-outline" size={20} color={colors.primary} />
                    <View style={styles.logisticsText}>
                      <Text style={[styles.logisticsLabel, { color: colors.textTertiary }]}>Room</Text>
                      <Text style={[styles.logisticsValue, { color: colors.textPrimary }]}>{assignment.room_number}</Text>
                    </View>
                  </View>
                )}
                {assignment.train_seat_number && (
                  <View style={styles.logisticsRow}>
                    <Icon name="train-outline" size={20} color={colors.primary} />
                    <View style={styles.logisticsText}>
                      <Text style={[styles.logisticsLabel, { color: colors.textTertiary }]}>Train Seat</Text>
                      <Text style={[styles.logisticsValue, { color: colors.textPrimary }]}>
                        {assignment.train_seat_number}
                      </Text>
                    </View>
                  </View>
                )}
                {assignment.bus_seat_number && (
                  <View style={styles.logisticsRow}>
                    <Icon name="bus-outline" size={20} color={colors.primary} />
                    <View style={styles.logisticsText}>
                      <Text style={[styles.logisticsLabel, { color: colors.textTertiary }]}>Bus Seat</Text>
                      <Text style={[styles.logisticsValue, { color: colors.textPrimary }]}>
                        {assignment.bus_seat_number}
                      </Text>
                    </View>
                  </View>
                )}
                {assignment.flight_ticket_number && (
                  <View style={styles.logisticsRow}>
                    <Icon name="airplane-outline" size={20} color={colors.primary} />
                    <View style={styles.logisticsText}>
                      <Text style={[styles.logisticsLabel, { color: colors.textTertiary }]}>Flight Ticket</Text>
                      <Text style={[styles.logisticsValue, { color: colors.textPrimary }]}>
                        {assignment.flight_ticket_number}
                      </Text>
                    </View>
                  </View>
                )}
                {assignment.pnr_number && (
                  <View style={styles.logisticsRow}>
                    <Icon name="receipt-outline" size={20} color={colors.primary} />
                    <View style={styles.logisticsText}>
                      <Text style={[styles.logisticsLabel, { color: colors.textTertiary }]}>PNR Number</Text>
                      <Text style={[styles.logisticsValue, { color: colors.textPrimary }]}>{assignment.pnr_number}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Registration Status (if registered) */}
          {registration && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Registration Status</Text>
              <View style={[styles.logisticsCard, { backgroundColor: colors.backgroundElevated }]}>
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
                    <Text style={[styles.logisticsLabel, { color: colors.textTertiary }]}>Status</Text>
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
                      <Text style={[styles.logisticsLabel, { color: colors.textTertiary }]}>Payment</Text>
                      <Text style={[styles.logisticsValue, { color: colors.textPrimary }]}>
                        {registration.payment_status}
                      </Text>
                    </View>
                  </View>
                )}
                <View style={styles.logisticsRow}>
                  <Icon name="calendar-outline" size={20} color={colors.primary} />
                  <View style={styles.logisticsText}>
                    <Text style={[styles.logisticsLabel, { color: colors.textTertiary }]}>Registered On</Text>
                    <Text style={[styles.logisticsValue, { color: colors.textPrimary }]}>
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
        <SafeAreaView style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]} edges={['bottom']}>
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
    marginBottom: 4,
  },
  destination: {
    fontSize: 18,
    fontWeight: '500',
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
  infoSubvalue: {
    fontSize: 13,
    marginTop: 2,
  },
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  itineraryDayText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  itineraryContent: {
    flex: 1,
  },
  itineraryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itineraryActivities: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  itineraryDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 2,
  },
  documentType: {
    fontSize: 12,
    textTransform: 'uppercase',
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
  includesContainer: {
    borderRadius: 12,
    padding: 16,
  },
  includesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  includesText: {
    fontSize: 13,
    lineHeight: 20,
  },
  logisticsCard: {
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
    marginBottom: 2,
  },
  logisticsValue: {
    fontSize: 15,
    fontWeight: '600',
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
