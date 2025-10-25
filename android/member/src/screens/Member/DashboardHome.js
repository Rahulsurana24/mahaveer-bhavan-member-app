import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import colors from '../../constants/colors';
import { formatDate } from '../../../shared/src/utils/dateHelpers';
import { supabase } from '../../services/supabase';

/**
 * Dashboard Home Screen
 * Member's landing page with overview and quick actions
 */
const DashboardHome = ({ navigation }) => {
  const { profile, user } = useAuth();
  const {
    events,
    myRegistrations,
    donations,
    loading,
    refetchEvents,
    refetchRegistrations,
    refetchDonations,
  } = useData(profile?.id);

  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messagesUnread, setMessagesUnread] = useState(0);

  /**
   * Load notifications on mount
   */
  useEffect(() => {
    if (profile?.id) {
      fetchNotifications();
      fetchUnreadMessages();
    }
  }, [profile?.id]);

  /**
   * Fetch recent notifications
   */
  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('member_id', profile?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!error && data) {
        setNotifications(data);
        const unread = data.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  /**
   * Fetch unread messages count
   */
  const fetchUnreadMessages = async () => {
    try {
      const { count, error } = await supabase
        .from('conversations')
        .select('unread_count', { count: 'exact' })
        .eq('member_id', profile?.id)
        .gt('unread_count', 0);

      if (!error) {
        setMessagesUnread(count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };

  /**
   * Get time-based greeting
   */
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  /**
   * Get first name from full name
   */
  const getFirstName = () => {
    if (!profile?.full_name) return 'Member';
    return profile.full_name.split(' ')[0];
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchEvents(),
      refetchRegistrations(),
      refetchDonations(),
      fetchNotifications(),
      fetchUnreadMessages(),
    ]);
    setRefreshing(false);
  };

  if (loading.events && !events.length) {
    return <Loader fullScreen text="Loading dashboard..." />;
  }

  // Calculate statistics
  const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const eventsAttended = myRegistrations.filter(r => r.attendance_marked).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Avatar
            uri={profile?.photo_url}
            name={profile?.full_name}
            size={48}
          />
        </TouchableOpacity>
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>{getGreeting()},</Text>
          <Text style={styles.nameText}>{getFirstName()}</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Icon name="notifications-outline" size={24} color={colors.textPrimary} />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Digital ID Card Preview */}
      <TouchableOpacity
        onPress={() => navigation.navigate('IDCard')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.idCardPreview}
        >
          <View style={styles.idCardContent}>
            <Avatar
              uri={profile?.photo_url}
              name={profile?.full_name}
              size={80}
              style={styles.idCardAvatar}
            />
            <View style={styles.idCardInfo}>
              <Text style={styles.idCardName}>{profile?.full_name || 'Member'}</Text>
              <Text style={styles.idCardId}>ID: {profile?.member_id || 'N/A'}</Text>
              <View style={styles.idCardBadge}>
                <Text style={styles.idCardBadgeText}>
                  {profile?.membership_type || 'Member'}
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={24} color={colors.textPrimary} />
          </View>
          <Text style={styles.idCardViewText}>Tap to view full ID card</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Quick Stats Row */}
      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Events')}
          activeOpacity={0.7}
        >
          <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
            <Icon name="calendar-outline" size={24} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>{eventsAttended}</Text>
          <Text style={styles.statLabel}>Events Attended</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Donations')}
          activeOpacity={0.7}
        >
          <View style={[styles.statIcon, { backgroundColor: '#F59E0B20' }]}>
            <Icon name="heart-outline" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.statValue}>₹{totalDonations}</Text>
          <Text style={styles.statLabel}>Donations Made</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Messages')}
          activeOpacity={0.7}
        >
          <View style={[styles.statIcon, { backgroundColor: '#3B82F620' }]}>
            <Icon name="chatbubbles-outline" size={24} color="#3B82F6" />
          </View>
          <Text style={styles.statValue}>{messagesUnread}</Text>
          <Text style={styles.statLabel}>Unread Messages</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Events')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
            <Icon name="calendar-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.actionText}>Register for Event</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Messages')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#3B82F620' }]}>
            <Icon name="chatbubbles-outline" size={32} color="#3B82F6" />
          </View>
          <Text style={styles.actionText}>Send Message</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Donations')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#F59E0B20' }]}>
            <Icon name="heart-outline" size={32} color="#F59E0B" />
          </View>
          <Text style={styles.actionText}>Make Donation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Gallery')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#8B5CF620' }]}>
            <Icon name="images-outline" size={32} color="#8B5CF6" />
          </View>
          <Text style={styles.actionText}>View Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Events */}
      {events.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Events')}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>
          {events.slice(0, 3).map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
              activeOpacity={0.7}
            >
              <View style={styles.eventIconContainer}>
                <Icon name="calendar" size={24} color={colors.primary} />
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventMeta}>
                  <Icon name="time-outline" size={14} color={colors.textTertiary} />
                  <Text style={styles.eventDate}>{formatDate(event.start_date)}</Text>
                </View>
                <View style={styles.eventMeta}>
                  <Icon name="location-outline" size={14} color={colors.textTertiary} />
                  <Text style={styles.eventLocation}>{event.location}</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Updates</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={styles.notificationCard}
              onPress={() => navigation.navigate('Notifications')}
              activeOpacity={0.7}
            >
              <View style={[
                styles.notificationIcon,
                !notification.is_read && styles.notificationIconUnread
              ]}>
                <Icon
                  name={getNotificationIcon(notification.type)}
                  size={20}
                  color={!notification.is_read ? colors.primary : colors.textSecondary}
                />
              </View>
              <View style={styles.notificationContent}>
                <Text style={[
                  styles.notificationTitle,
                  !notification.is_read && styles.notificationTitleUnread
                ]}>
                  {notification.title}
                </Text>
                <Text style={styles.notificationTime}>
                  {formatNotificationTime(notification.created_at)}
                </Text>
              </View>
              {!notification.is_read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
};

/**
 * Get icon name based on notification type
 */
const getNotificationIcon = (type) => {
  const iconMap = {
    event: 'calendar-outline',
    message: 'chatbubble-outline',
    donation: 'heart-outline',
    announcement: 'megaphone-outline',
    reminder: 'alarm-outline',
  };
  return iconMap[type] || 'notifications-outline';
};

/**
 * Format notification timestamp
 */
const formatNotificationTime = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now - time;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(timestamp);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  avatarButton: {
    marginRight: 12,
  },
  greetingSection: {
    flex: 1,
  },
  greetingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  // ID Card Preview
  idCardPreview: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  idCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  idCardAvatar: {
    marginRight: 16,
    borderWidth: 3,
    borderColor: colors.textPrimary,
  },
  idCardInfo: {
    flex: 1,
  },
  idCardName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  idCardId: {
    fontSize: 14,
    color: colors.textPrimary,
    opacity: 0.8,
    marginBottom: 8,
  },
  idCardBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.textPrimary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  idCardBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  idCardViewText: {
    fontSize: 12,
    color: colors.textPrimary,
    opacity: 0.7,
    textAlign: 'center',
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundElevated,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Sections
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  // Quick Actions
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    width: '48%',
    backgroundColor: colors.backgroundElevated,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  // Events
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  eventIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 6,
  },
  eventDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  eventLocation: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  // Notifications
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationIconUnread: {
    backgroundColor: colors.primary + '20',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  notificationTitleUnread: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});

export default DashboardHome;
