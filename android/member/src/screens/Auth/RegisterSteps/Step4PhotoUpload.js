/**
 * Step 4: Photo Upload
 * Collects: Profile Photo
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

import colors from '../../../constants/colors';

export default function Step4PhotoUpload({ formData, updateFormData, errors }) {
  /**
   * Handle photo selection
   */
  const handleSelectPhoto = () => {
    Alert.alert(
      'Select Photo',
      'Choose a clear photo for your profile',
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
      saveToPhotos: false,
      cameraType: 'front',
    };

    try {
      const result = await launchCamera(options);
      handleImageResult(result);
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
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
      selectionLimit: 1,
    };

    try {
      const result = await launchImageLibrary(options);
      handleImageResult(result);
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  /**
   * Handle image picker result
   */
  const handleImageResult = (result) => {
    if (result.didCancel) {
      return;
    }

    if (result.errorCode) {
      Alert.alert('Error', result.errorMessage || 'Failed to select image');
      return;
    }

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      updateFormData('photoUri', asset.uri);
      updateFormData('photoUrl', null);
    }
  };

  /**
   * Remove photo
   */
  const handleRemovePhoto = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            updateFormData('photoUri', null);
            updateFormData('photoUrl', null);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Profile Photo</Text>
      <Text style={styles.stepSubtitle}>
        Upload a clear photo of yourself for identification
      </Text>

      {/* Photo Display */}
      <View style={styles.photoSection}>
        {formData.photoUri || formData.photoUrl ? (
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: formData.photoUri || formData.photoUrl }}
              style={styles.photo}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemovePhoto}
            >
              <Icon name="close-circle" size={32} color={colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.uploadPlaceholder,
              errors.photo && styles.uploadPlaceholderError,
            ]}
            onPress={handleSelectPhoto}
          >
            <View style={styles.uploadIcon}>
              <Icon name="camera-outline" size={48} color={colors.primary} />
            </View>
            <Text style={styles.uploadText}>Tap to add photo</Text>
            <Text style={styles.uploadSubtext}>
              Take a photo or choose from gallery
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {errors.photo && (
        <Text style={styles.errorText}>{errors.photo}</Text>
      )}

      {/* Action Buttons */}
      {(formData.photoUri || formData.photoUrl) && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSelectPhoto}
          >
            <Icon name="sync-outline" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>Change Photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Guidelines */}
      <View style={styles.guidelines}>
        <Text style={styles.guidelinesTitle}>Photo Guidelines:</Text>
        <View style={styles.guidelineItem}>
          <Icon name="checkmark-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.guidelineText}>Use a clear, recent photo</Text>
        </View>
        <View style={styles.guidelineItem}>
          <Icon name="checkmark-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.guidelineText}>Face should be clearly visible</Text>
        </View>
        <View style={styles.guidelineItem}>
          <Icon name="checkmark-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.guidelineText}>Avoid filters or heavy editing</Text>
        </View>
        <View style={styles.guidelineItem}>
          <Icon name="checkmark-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.guidelineText}>Use good lighting</Text>
        </View>
      </View>

      {/* Privacy Note */}
      <View style={styles.infoBox}>
        <Icon name="shield-checkmark-outline" size={20} color={colors.primary} />
        <Text style={styles.infoText}>
          Your photo will be used for your digital ID card and will only be visible to authorized members and administrators.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: colors.primary,
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.backgroundElevated,
    borderRadius: 16,
  },
  uploadPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  uploadPlaceholderError: {
    borderColor: colors.error,
  },
  uploadIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    textAlign: 'center',
    marginTop: -16,
    marginBottom: 16,
  },
  actions: {
    alignItems: 'center',
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  guidelines: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
