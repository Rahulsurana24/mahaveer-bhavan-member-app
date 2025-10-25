/**
 * Events List Screen - Browse events and trips
 * Features tabs for Events/Trips, filters, search
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../hooks/useAuth';
import colors from '../../constants/colors';
import { supabase } from '../../services/supabase';

const Tab = createMaterialTopTabNavigator();

export default function EventsListScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events & Trips</Text>
      </View>

      {/* Tabs */}
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: colors.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarIndicatorStyle: {
            backgroundColor: colors.primary,
            height: 3,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '600',
            textTransform: 'none',
          },
        }}
      >
        <Tab.Screen name="Events">
          {(props) => <EventsTab {...props} navigation={navigation} />}
        </Tab.Screen>
        <Tab.Screen name="Trips">
          {(props) => <TripsTab {...props} navigation={navigation} />}
        </Tab.Screen>
      </Tab.Navigator>
    </SafeAreaView>
  );
}

/**
 * Events Tab
 */
function EventsTab({ navigation }) {
  const { profile } = useAuth();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('upcoming'); // all, upcoming, past, registered

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, searchQuery, filter]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          registrations:event_registrations(count)
        `)
        .eq('is_published', true)
        .order('start_date', { ascending: true });

      if (error) throw error;

      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = events;

    // Apply search
    if (searchQuery.trim()) {
      filtered = filtered.filter((event) =>
        event.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filter
    const now = new Date();
    if (filter === 'upcoming') {
      filtered = filtered.filter((event) => new Date(event.start_date) >= now);
    } else if (filter === 'past') {
      filtered = filtered.filter((event) => new Date(event.start_date) < now);
    }
    // TODO: Add 'registered' filter by checking event_registrations

    setFilteredEvents(filtered);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadEvents();
  }, []);

  const renderEvent = ({ item }) => (
    <EventCard event={item} navigation={navigation} />
  );

  return (
    <View style={styles.tabContainer}>
      {/* Search and Filter */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchBar}>
          <Icon name="search-outline" size={20} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterRow}>
          {['upcoming', 'past', 'all'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === f && styles.filterChipTextActive,
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Events List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderEvent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="calendar-outline" size={64} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No events found</Text>
            </View>
          }
          contentContainerStyle={
            filteredEvents.length === 0 && styles.emptyListContent
          }
        />
      )}
    </View>
  );
}

/**
 * Trips Tab
 */
function TripsTab({ navigation }) {
  const { profile } = useAuth();
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    loadTrips();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trips, searchQuery, filter]);

  const loadTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          registrations:trip_registrations(count)
        `)
        .eq('is_published', true)
        .order('start_date', { ascending: true });

      if (error) throw error;

      setTrips(data || []);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = trips;

    if (searchQuery.trim()) {
      filtered = filtered.filter((trip) =>
        trip.destination?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const now = new Date();
    if (filter === 'upcoming') {
      filtered = filtered.filter((trip) => new Date(trip.start_date) >= now);
    } else if (filter === 'past') {
      filtered = filtered.filter((trip) => new Date(trip.start_date) < now);
    }

    setFilteredTrips(filtered);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTrips();
  }, []);

  const renderTrip = ({ item }) => (
    <TripCard trip={item} navigation={navigation} />
  );

  return (
    <View style={styles.tabContainer}>
      {/* Search and Filter */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchBar}>
          <Icon name="search-outline" size={20} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search trips..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterRow}>
          {['upcoming', 'past', 'all'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === f && styles.filterChipTextActive,
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Trips List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => item.id}
          renderItem={renderTrip}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="airplane-outline" size={64} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No trips found</Text>
            </View>
          }
          contentContainerStyle={
            filteredTrips.length === 0 && styles.emptyListContent
          }
        />
      )}
    </View>
  );
}

/**
 * Event Card Component
 */
function EventCard({ event, navigation }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isUpcoming = new Date(event.start_date) >= new Date();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
      activeOpacity={0.7}
    >
      {/* Event Image */}
      {event.image_url && (
        <Image source={{ uri: event.image_url }} style={styles.cardImage} />
      )}

      {/* Fee Badge */}
      <View style={styles.feeBadge}>
        <Text style={styles.feeBadgeText}>
          {event.base_fee > 0 ? `₹${event.base_fee}` : 'Free'}
        </Text>
      </View>

      {/* Status Badge */}
      {!isUpcoming && (
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>Completed</Text>
        </View>
      )}

      {/* Card Content */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.cardInfo}>
          <Icon name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.cardInfoText}>
            {formatDate(event.start_date)}
            {event.end_date && ` - ${formatDate(event.end_date)}`}
          </Text>
        </View>

        {event.location && (
          <View style={styles.cardInfo}>
            <Icon name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.cardInfoText} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
        )}

        {event.capacity && (
          <View style={styles.cardInfo}>
            <Icon name="people-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.cardInfoText}>
              {event.registrations?.[0]?.count || 0} / {event.capacity} registered
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

/**
 * Trip Card Component
 */
function TripCard({ trip, navigation }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isUpcoming = new Date(trip.start_date) >= new Date();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TripDetail', { tripId: trip.id })}
      activeOpacity={0.7}
    >
      {/* Trip Image */}
      {trip.image_url && (
        <Image source={{ uri: trip.image_url }} style={styles.cardImage} />
      )}

      {/* Price Badge */}
      <View style={styles.feeBadge}>
        <Text style={styles.feeBadgeText}>₹{trip.price}</Text>
      </View>

      {/* Status Badge */}
      {!isUpcoming && (
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>Completed</Text>
        </View>
      )}

      {/* Card Content */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {trip.destination}
        </Text>

        <View style={styles.cardInfo}>
          <Icon name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.cardInfoText}>
            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
          </Text>
        </View>

        {trip.transport_type && (
          <View style={styles.cardInfo}>
            <Icon name="bus-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.cardInfoText}>{trip.transport_type}</Text>
          </View>
        )}

        {trip.capacity && (
          <View style={styles.cardInfo}>
            <Icon name="people-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.cardInfoText}>
              {trip.registrations?.[0]?.count || 0} / {trip.capacity} registered
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tabContainer: {
    flex: 1,
  },
  searchFilterContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.backgroundSecondary,
  },
  feeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  feeBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.textTertiary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyListContent: {
    flex: 1,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
  },
});
