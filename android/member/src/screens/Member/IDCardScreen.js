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
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import { membershipColors } from '../../constants/colors';
import { supabase } from '../../services/supabase/client';

export default function IDCardScreen({ navigation }) {
  const { colors, isDark } = useTheme();
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
    return membershipColors[profile?.membership_type] || colors.primary;
  };

  // ID Card should be light colored (like physical card) regardless of theme
  const cardColors = {
    background: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    qrBg: '#FFFFFF',
    qrFg: '#000000',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
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
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Digital ID Card</Text>
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
            <View style={[styles.idCard, { backgroundColor: cardColors.background }]}>
              {/* Header Banner */}
              <View style={[styles.cardHeader, { borderBottomColor: cardColors.border }]}>
                <Text style={[styles.orgName, { color: cardColors.text }]}>
                  {systemSettings?.trust_name || 'Sree Mahaveer Seva'}
                </Text>
                <Text style={[styles.orgSubtitle, { color: cardColors.textSecondary }]}>Digital Member ID</Text>
              </View>

              {/* Member Photo */}
              <View style={styles.photoContainer}>
                <Avatar
                  uri={profile?.photo_url}
                  name={profile?.full_name}
                  size={150}
                  style={[styles.memberPhoto, { borderColor: colors.primary }]}
                />
              </View>

              {/* Member Details */}
              <View style={styles.detailsContainer}>
                <Text style={[styles.memberName, { color: cardColors.text }]}>
                  {profile?.full_name || 'Member Name'}
                </Text>
                <Text style={[styles.memberId, { color: cardColors.textSecondary }]}>
                  ID: {profile?.member_id || 'N/A'}
                </Text>

                {/* Membership Type Badge */}
                <View
                  style={[
                    styles.membershipBadge,
                    { backgroundColor: getMembershipBadgeColor() },
                  ]}
                >
                  <Text style={[styles.membershipText, { color: '#FFFFFF' }]}>
                    {profile?.membership_type || 'Member'}
                  </Text>
                </View>

                {/* Additional Info */}
                <View style={styles.infoRow}>
                  <Icon name="call-outline" size={16} color={cardColors.textSecondary} />
                  <Text style={[styles.infoText, { color: cardColors.textSecondary }]}>
                    {profile?.mobile || 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="mail-outline" size={16} color={cardColors.textSecondary} />
                  <Text style={[styles.infoText, { color: cardColors.textSecondary }]}>
                    {profile?.email || 'N/A'}
                  </Text>
                </View>
              </View>

              {/* QR Code */}
              <View style={[styles.qrContainer, { backgroundColor: cardColors.qrBg }]}>
                <QRCode
                  value={getQRData()}
                  size={200}
                  color={cardColors.qrFg}
                  backgroundColor={cardColors.qrBg}
                />
              </View>

              {/* Footer */}
              <View style={[styles.cardFooter, { borderTopColor: cardColors.border }]}>
                <Icon name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={[styles.footerText, { color: colors.primary }]}>Valid Member</Text>
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
        <View style={[styles.infoBox, { backgroundColor: colors.primary + '20' }]}>
          <Icon name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.infoBoxText, { color: colors.textSecondary }]}>
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
  },
  orgName: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  orgSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  memberPhoto: {
    borderWidth: 4,
  },
  detailsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  memberName: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  memberId: {
    fontSize: 16,
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
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 2,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
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
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
});
