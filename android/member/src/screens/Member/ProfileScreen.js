/**
 * Profile Screen
 * Member's profile with personal information, stats, and settings
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import colors, { getMembershipColor } from '../../constants/colors';
import { supabase } from '../../services/supabase';
import { formatDate } from '../../../shared/src/utils/dateHelpers';

export default function ProfileScreen({ navigation }) {
  const { profile, user, logout } = useAuth();
  const [stats, setStats] = useState({
    eventsAttended: 0,
    totalDonations: 0,
  });
  const [uploading, setUploading] = useState(false);

  /**
   * Load member stats on mount
   */
  useEffect(() => {
    if (profile?.id) {
      fetchStats();
    }
  }, [profile?.id]);

  /**
   * Fetch member statistics
   */
  const fetchStats = async () => {
    try {
      // Fetch events attended
      const { count: eventsCount } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('member_id', profile?.id)
        .eq('attendance_marked', true);

      // Fetch total donations
      const { data: donations } = await supabase
        .from('donations')
        .select('amount')
        .eq('member_id', profile?.id);

      const totalDonations = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

      setStats({
        eventsAttended: eventsCount || 0,
        totalDonations,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  /**
   * Handle photo update
   */
  const handleUpdatePhoto = () => {
    Alert.alert(
      'Update Photo',
      'Choose a new profile photo',
      [
        {
          text: 'Take Photo',
          onPress: () => openCamera(),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => openGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  /**
   * Open camera
   */
  const openCamera = async () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
      cameraType: 'front',
    };

    try {
      const result = await launchCamera(options);
      if (!result.didCancel && result.assets?.[0]) {
        await uploadPhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  /**
   * Open gallery
   */
  const openGallery = async () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
    };

    try {
      const result = await launchImageLibrary(options);
      if (!result.didCancel && result.assets?.[0]) {
        await uploadPhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Gallery error:', error);
    }
  };

  /**
   * Upload photo to Supabase Storage
   */
  const uploadPhoto = async (photo) => {
    setUploading(true);

    try {
      const fileExt = photo.fileName?.split('.').pop() || 'jpg';
      const fileName = `${profile?.member_id}_${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      // Upload to Supabase Storage
      const formData = new FormData();
      formData.append('file', {
        uri: photo.uri,
        type: photo.type || 'image/jpeg',
        name: fileName,
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, formData);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      // Update member record
      const { error: updateError } = await supabase
        .from('members')
        .update({ photo_url: urlData.publicUrl })
        .eq('id', profile?.id);

      if (updateError) throw updateError;

      Alert.alert('Success', 'Profile photo updated successfully');

      // Refresh profile
      // The useAuth hook should handle this automatically via subscription
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to update photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          },
        },
      ]
    );
  };

  /**
   * Make phone call
   */
  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  /**
   * Send email
   */
  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  /**
   * Get membership badge color
   */
  const getBadgeColor = () => {
    return getMembershipColor(profile?.membership_type) || colors.primary;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.backButton} />
        </View>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Avatar
              uri={profile?.photo_url}
              name={profile?.full_name}
              size={120}
            />
            <TouchableOpacity
              style={styles.editPhotoButton}
              onPress={handleUpdatePhoto}
              disabled={uploading}
            >
              <Icon
                name={uploading ? 'hourglass-outline' : 'camera'}
                size={20}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{profile?.full_name || 'Member'}</Text>
          <Text style={styles.memberId}>ID: {profile?.member_id || 'N/A'}</Text>
        </View>

        {/* Stats Badges */}
        <View style={styles.statsContainer}>
          <View style={styles.statBadge}>
            <Icon name="calendar-outline" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{stats.eventsAttended}</Text>
            <Text style={styles.statLabel}>Events Attended</Text>
          </View>
          <View style={styles.statBadge}>
            <Icon name="heart-outline" size={24} color="#F59E0B" />
            <Text style={styles.statValue}>₹{stats.totalDonations}</Text>
            <Text style={styles.statLabel}>Donations</Text>
          </View>
          <View style={styles.statBadge}>
            <Icon name="time-outline" size={24} color={colors.primary} />
            <Text style={styles.statValue}>
              {profile?.created_at ? new Date(profile.created_at).getFullYear() : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Member Since</Text>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Icon name="create-outline" size={20} color={colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <InfoRow
            icon="calendar-outline"
            label="Date of Birth"
            value={profile?.date_of_birth ? formatDate(profile.date_of_birth) : 'N/A'}
          />
          <InfoRow
            icon="person-outline"
            label="Gender"
            value={profile?.gender || 'N/A'}
          />
          <InfoRow
            icon="water-outline"
            label="Blood Group"
            value={profile?.blood_group || 'N/A'}
          />
          <InfoRow
            icon="ribbon-outline"
            label="Membership Type"
            value={profile?.membership_type || 'N/A'}
            valueStyle={{ color: getBadgeColor(), fontWeight: '600' }}
          />
          <InfoRow
            icon="call-outline"
            label="Mobile"
            value={profile?.mobile || 'N/A'}
            onPress={() => profile?.mobile && handleCall(profile.mobile)}
            pressable
          />
          <InfoRow
            icon="mail-outline"
            label="Email"
            value={profile?.email || 'N/A'}
            onPress={() => profile?.email && handleEmail(profile.email)}
            pressable
          />
          <InfoRow
            icon="location-outline"
            label="Address"
            value={
              profile?.address
                ? `${profile.address.line1 || ''}${profile.address.line2 ? ', ' + profile.address.line2 : ''}\n${profile.address.city || ''}, ${profile.address.state || ''} ${profile.address.pin_code || ''}`
                : 'N/A'
            }
            multiline
          />
        </View>

        {/* Emergency Contact */}
        {profile?.emergency_contact && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Emergency Contact</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Icon name="create-outline" size={20} color={colors.primary} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <InfoRow
              icon="person-circle-outline"
              label="Name"
              value={profile.emergency_contact.name || 'N/A'}
            />
            <InfoRow
              icon="call-outline"
              label="Phone"
              value={profile.emergency_contact.phone || 'N/A'}
              onPress={() =>
                profile.emergency_contact.phone &&
                handleCall(profile.emergency_contact.phone)
              }
              pressable
            />
            <InfoRow
              icon="people-outline"
              label="Relation"
              value={profile.emergency_contact.relation || 'N/A'}
            />
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <SettingsRow
            icon="lock-closed-outline"
            label="Change Password"
            onPress={() => navigation.navigate('ChangePassword', { forced: false })}
          />
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            onPress={() => navigation.navigate('NotificationSettings')}
          />
          <SettingsRow
            icon="language-outline"
            label="Language"
            value="English"
            onPress={() => Alert.alert('Coming Soon', 'Language selection will be available soon')}
          />
          <SettingsRow
            icon="information-circle-outline"
            label="About"
            onPress={() => navigation.navigate('About')}
          />
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            title="Logout"
            variant="danger"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Info Row Component
 */
const InfoRow = ({ icon, label, value, onPress, pressable, multiline, valueStyle }) => (
  <TouchableOpacity
    style={styles.infoRow}
    onPress={onPress}
    disabled={!pressable}
    activeOpacity={pressable ? 0.7 : 1}
  >
    <View style={styles.infoIcon}>
      <Icon name={icon} size={20} color={colors.primary} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueStyle]} numberOfLines={multiline ? 3 : 1}>
        {value}
      </Text>
    </View>
    {pressable && (
      <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
    )}
  </TouchableOpacity>
);

/**
 * Settings Row Component
 */
const SettingsRow = ({ icon, label, value, onPress }) => (
  <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.settingsIcon}>
      <Icon name={icon} size={22} color={colors.primary} />
    </View>
    <Text style={styles.settingsLabel}>{label}</Text>
    {value && <Text style={styles.settingsValue}>{value}</Text>}
    <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
  </TouchableOpacity>
);

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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  memberId: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  statBadge: {
    flex: 1,
    backgroundColor: colors.backgroundElevated,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.backgroundElevated,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingsIcon: {
    marginRight: 12,
  },
  settingsLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  settingsValue: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  logoutContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  logoutButton: {
    marginTop: 8,
  },
});
