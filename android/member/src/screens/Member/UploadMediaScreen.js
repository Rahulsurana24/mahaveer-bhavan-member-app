/**
 * Upload Media Screen - Upload posts for admin approval
 * Supports images and videos with captions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import { supabase } from '../../services/supabase/client';

export default function UploadMediaScreen({ navigation }) {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  /**
   * Choose media source
   */
  const handleChooseMedia = () => {
    Alert.alert(
      'Choose Media',
      'Select source for your media',
      [
        {
          text: 'Camera',
          onPress: () => openCamera(),
        },
        {
          text: 'Gallery',
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
    try {
      const { launchCamera } = require('react-native-image-picker');

      const options = {
        mediaType: 'mixed',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
        videoQuality: 'high',
        durationLimit: 60, // 1 minute max for videos
      };

      launchCamera(options, (response) => {
        if (response.didCancel) {
          return;
        }

        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Failed to open camera');
          return;
        }

        if (response.assets && response.assets[0]) {
          setSelectedMedia(response.assets[0]);
        }
      });
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera. Please check permissions.');
    }
  };

  /**
   * Open gallery
   */
  const openGallery = async () => {
    try {
      const { launchImageLibrary } = require('react-native-image-picker');

      const options = {
        mediaType: 'mixed',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
        videoQuality: 'high',
      };

      launchImageLibrary(options, (response) => {
        if (response.didCancel) {
          return;
        }

        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Failed to open gallery');
          return;
        }

        if (response.assets && response.assets[0]) {
          setSelectedMedia(response.assets[0]);
        }
      });
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery. Please check permissions.');
    }
  };

  /**
   * Upload media to Supabase Storage
   */
  const uploadMediaFile = async () => {
    if (!selectedMedia) {
      Alert.alert('Error', 'Please select a photo or video');
      return;
    }

    if (!profile?.id) {
      Alert.alert('Error', 'You must be logged in to upload media');
      return;
    }

    setUploading(true);

    try {
      // Determine file extension
      const isVideo = selectedMedia.type?.startsWith('video');
      const fileExt = selectedMedia.fileName?.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
      const fileName = `${profile.id}_${Date.now()}.${fileExt}`;
      const filePath = `pending/${fileName}`;

      // Read file as blob for upload
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? selectedMedia.uri : selectedMedia.uri.replace('file://', ''),
        type: selectedMedia.type,
        name: fileName,
      });

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery-media')
        .upload(filePath, formData, {
          contentType: selectedMedia.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('gallery-media')
        .getPublicUrl(filePath);

      // Insert record into gallery table (pending approval)
      const { data: galleryData, error: galleryError } = await supabase
        .from('gallery')
        .insert({
          media_url: urlData.publicUrl,
          media_type: isVideo ? 'video' : 'image',
          caption: caption.trim() || null,
          item_type: 'post',
          is_approved: false, // Pending admin approval
          member_id: profile.id,
        })
        .select()
        .single();

      if (galleryError) throw galleryError;

      // Success
      Alert.alert(
        'Success',
        'Your post has been submitted for review. It will be visible after admin approval.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );

      // Clear form
      setSelectedMedia(null);
      setCaption('');
    } catch (error) {
      console.error('Error uploading media:', error);
      Alert.alert('Error', 'Failed to upload media. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Remove selected media
   */
  const handleRemoveMedia = () => {
    setSelectedMedia(null);
  };

  const isVideo = selectedMedia?.type?.startsWith('video');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="close" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Upload Post</Text>
        <View style={styles.closeButton} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Media Preview or Select Button */}
        {selectedMedia ? (
          <View style={[styles.mediaPreviewContainer, { backgroundColor: colors.backgroundElevated }]}>
            {isVideo ? (
              <View style={[styles.videoPreview, { backgroundColor: colors.backgroundSecondary }]}>
                <Icon name="videocam" size={64} color={colors.primary} />
                <Text style={[styles.videoText, { color: colors.textPrimary }]}>Video selected</Text>
                <Text style={[styles.videoFilename, { color: colors.textSecondary }]}>
                  {selectedMedia.fileName}
                </Text>
              </View>
            ) : (
              <Image
                source={{ uri: selectedMedia.uri }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
            )}
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: colors.background }]}
              onPress={handleRemoveMedia}
            >
              <Icon name="close-circle" size={32} color={colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.selectMediaButton, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}
            onPress={handleChooseMedia}
          >
            <Icon name="images-outline" size={64} color={colors.primary} />
            <Text style={[styles.selectMediaText, { color: colors.textPrimary }]}>Choose Photo or Video</Text>
            <Text style={[styles.selectMediaSubtext, { color: colors.textSecondary }]}>
              Tap to select from camera or gallery
            </Text>
          </TouchableOpacity>
        )}

        {/* Caption Input */}
        <View style={styles.captionContainer}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Caption (Optional)</Text>
          <TextInput
            style={[styles.captionInput, { backgroundColor: colors.backgroundElevated, color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="Write a caption..."
            placeholderTextColor={colors.textTertiary}
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: colors.textTertiary }]}>
            {caption.length}/500
          </Text>
        </View>

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: colors.info + '20' }]}>
          <Icon name="information-circle-outline" size={20} color={colors.info} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Your post will be reviewed by admins before being published to the gallery.
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Button
          title="Submit for Review"
          onPress={uploadMediaFile}
          loading={uploading}
          disabled={!selectedMedia || uploading}
          variant="primary"
          style={styles.submitButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  selectMediaButton: {
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginBottom: 24,
  },
  selectMediaText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  selectMediaSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  mediaPreviewContainer: {
    position: 'relative',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  videoFilename: {
    fontSize: 14,
    marginTop: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 16,
  },
  captionContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  captionInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    minHeight: 120,
    borderWidth: 1,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  infoBox: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  submitButton: {
    width: '100%',
  },
});
