/**
 * Digital ID Card Screen
 * Full-screen modal displaying member's digital ID card with QR code
 * Download as PDF/JPG and share capabilities
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  PermissionsAndroid,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import colors, { getMembershipColor } from '../../constants/colors';
import { supabase } from '../../services/supabase';

export default function IDCardScreen({ navigation }) {
  const { profile } = useAuth();
  const viewShotRef = useRef();
  const [systemSettings, setSystemSettings] = useState(null);
  const [downloading, setDownloading] = useState(false);

  /**
   * Load system settings for organization name and logo
   */
  useEffect(() => {
    fetchSystemSettings();
  }, []);

  const fetchSystemSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('trust_name, logo_url, primary_color')
        .single();

      if (!error && data) {
        setSystemSettings(data);
      }
    } catch (error) {
      console.error('Error fetching system settings:', error);
    }
  };

  /**
   * Generate QR code data
   * Format: MEMBER:{memberID}:{fullName}
   */
  const getQRData = () => {
    return `MEMBER:${profile?.member_id || 'UNKNOWN'}:${profile?.full_name || 'Unknown'}`;
  };

  /**
   * Request storage permissions (Android)
   */
  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to your storage to save ID card',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  /**
   * Download ID card as JPG
   */
  const handleDownloadJPG = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Storage permission is required to save ID card');
      return;
    }

    setDownloading(true);

    try {
      const uri = await viewShotRef.current.capture();

      // Save to device storage
      const CameraRoll = require('@react-native-camera-roll/camera-roll');
      const result = await CameraRoll.save(uri, { type: 'photo' });

      Alert.alert(
        'Success',
        'ID card saved to your gallery',
        [
          { text: 'OK', style: 'default' },
          {
            text: 'Share',
            onPress: () => handleShare(uri),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving JPG:', error);
      Alert.alert('Error', 'Failed to save ID card. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  /**
   * Share ID card
   */
  const handleShare = async (uri) => {
    try {
      let imageUri = uri;

      // If no URI provided, capture first
      if (!imageUri) {
        imageUri = await viewShotRef.current.capture();
      }

      await Share.share({
        url: imageUri,
        message: `${profile?.full_name}'s Digital ID Card - ${systemSettings?.trust_name || 'Mahaveer Seva'}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  /**
   * Get membership type color
   */
  const getMembershipBadgeColor = () => {
    return getMembershipColor(profile?.membership_type) || colors.primary;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Digital ID Card</Text>
          <View style={styles.closeButton} />
        </View>

        {/* ID Card View */}
        <View style={styles.cardContainer}>
          <ViewShot
            ref={viewShotRef}
            options={{
              format: 'jpg',
              quality: 1.0,
              result: 'tmpfile',
            }}
            style={styles.viewShot}
          >
            <View style={styles.idCard}>
              {/* Header Banner */}
              <View style={styles.cardHeader}>
                <Text style={styles.orgName}>
                  {systemSettings?.trust_name || 'Sree Mahaveer Seva'}
                </Text>
                <Text style={styles.orgSubtitle}>Digital Member ID</Text>
              </View>

              {/* Member Photo */}
              <View style={styles.photoContainer}>
                <Avatar
                  uri={profile?.photo_url}
                  name={profile?.full_name}
                  size={150}
                  style={styles.memberPhoto}
                />
              </View>

              {/* Member Details */}
              <View style={styles.detailsContainer}>
                <Text style={styles.memberName}>
                  {profile?.full_name || 'Member Name'}
                </Text>
                <Text style={styles.memberId}>
                  ID: {profile?.member_id || 'N/A'}
                </Text>

                {/* Membership Type Badge */}
                <View
                  style={[
                    styles.membershipBadge,
                    { backgroundColor: getMembershipBadgeColor() },
                  ]}
                >
                  <Text style={styles.membershipText}>
                    {profile?.membership_type || 'Member'}
                  </Text>
                </View>

                {/* Additional Info */}
                <View style={styles.infoRow}>
                  <Icon name="call-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.infoText}>
                    {profile?.mobile || 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="mail-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.infoText}>
                    {profile?.email || 'N/A'}
                  </Text>
                </View>
              </View>

              {/* QR Code */}
              <View style={styles.qrContainer}>
                <QRCode
                  value={getQRData()}
                  size={200}
                  color={colors.background}
                  backgroundColor={colors.textPrimary}
                />
              </View>

              {/* Footer */}
              <View style={styles.cardFooter}>
                <Icon name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={styles.footerText}>Valid Member</Text>
              </View>
            </View>
          </ViewShot>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Download as Image"
            onPress={handleDownloadJPG}
            loading={downloading}
            variant="primary"
            style={styles.actionButton}
          />

          <Button
            title="Share ID Card"
            onPress={() => handleShare()}
            variant="secondary"
            style={styles.actionButton}
          />
        </View>

        {/* Info Message */}
        <View style={styles.infoBox}>
          <Icon name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.infoBoxText}>
            This digital ID card can be used for event check-ins and verification. Keep it accessible in your device.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  closeButton: {
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
  cardContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  viewShot: {
    alignItems: 'center',
  },
  idCard: {
    width: '100%',
    backgroundColor: colors.textPrimary,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  orgName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.background,
    textAlign: 'center',
    marginBottom: 4,
  },
  orgSubtitle: {
    fontSize: 14,
    color: colors.backgroundSecondary,
    textAlign: 'center',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  memberPhoto: {
    borderWidth: 4,
    borderColor: colors.primary,
  },
  detailsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  memberName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.background,
    textAlign: 'center',
    marginBottom: 8,
  },
  memberId: {
    fontSize: 16,
    color: colors.backgroundSecondary,
    marginBottom: 16,
  },
  membershipBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  membershipText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: colors.backgroundSecondary,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: colors.textPrimary,
    borderRadius: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  actionsContainer: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    width: '100%',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '20',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
