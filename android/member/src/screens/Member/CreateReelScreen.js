/**
 * Create Reel Screen - Upload short vertical videos
 * Instagram Reels / TikTok style content
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import colors from '../../constants/colors';
import { supabase } from '../../services/supabase';

export default function CreateReelScreen({ navigation }) {
  const { profile } = useAuth();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  /**
   * Prompt user to choose video source on mount
   */
  React.useEffect(() => {
    promptVideoSource();
  }, []);

  /**
   * Prompt video source
   */
  const promptVideoSource = () => {
    Alert.alert(
      'Create Reel',
      'Choose how to create your reel',
      [
        {
          text: 'Record Video',
          onPress: () => recordVideo(),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => chooseFromGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => navigation.goBack(),
        },
      ],
      { cancelable: false }
    );
  };

  /**
   * Record video using camera
   */
  const recordVideo = async () => {
    try {
      const { launchCamera } = require('react-native-image-picker');

      const options = {
        mediaType: 'video',
        videoQuality: 'high',
        durationLimit: 60, // 60 seconds max
        saveToPhotos: false,
      };

      launchCamera(options, (response) => {
        if (response.didCancel) {
          navigation.goBack();
          return;
        }

        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Failed to record video');
          navigation.goBack();
          return;
        }

        if (response.assets && response.assets[0]) {
          setSelectedVideo(response.assets[0]);
        }
      });
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Error', 'Failed to open camera. Please check permissions.');
      navigation.goBack();
    }
  };

  /**
   * Choose video from gallery
   */
  const chooseFromGallery = async () => {
    try {
      const { launchImageLibrary } = require('react-native-image-picker');

      const options = {
        mediaType: 'video',
        videoQuality: 'high',
      };

      launchImageLibrary(options, (response) => {
        if (response.didCancel) {
          navigation.goBack();
          return;
        }

        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Failed to select video');
          navigation.goBack();
          return;
        }

        if (response.assets && response.assets[0]) {
          // Check video duration
          const duration = response.assets[0].duration;
          if (duration && duration > 60) {
            Alert.alert(
              'Video Too Long',
              'Reels must be 60 seconds or less. Please choose a shorter video.',
              [
                {
                  text: 'Choose Another',
                  onPress: () => chooseFromGallery(),
                },
                {
                  text: 'Cancel',
                  style: 'cancel',
                  onPress: () => navigation.goBack(),
                },
              ]
            );
            return;
          }

          setSelectedVideo(response.assets[0]);
        }
      });
    } catch (error) {
      console.error('Error choosing video:', error);
      Alert.alert('Error', 'Failed to open gallery. Please check permissions.');
      navigation.goBack();
    }
  };

  /**
   * Upload reel
   */
  const handleUploadReel = async () => {
    if (!selectedVideo) {
      Alert.alert('Error', 'Please select a video');
      return;
    }

    if (!profile?.id) {
      Alert.alert('Error', 'You must be logged in to post reels');
      return;
    }

    const trimmedCaption = caption.trim();

    setUploading(true);

    try {
      // Generate file path
      const fileExt = selectedVideo.fileName?.split('.').pop() || 'mp4';
      const fileName = `${profile.id}_${Date.now()}.${fileExt}`;
      const filePath = `reels/${fileName}`;

      // Prepare form data
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? selectedVideo.uri : selectedVideo.uri.replace('file://', ''),
        type: selectedVideo.type || 'video/mp4',
        name: fileName,
      });

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery-media')
        .upload(filePath, formData, {
          contentType: selectedVideo.type || 'video/mp4',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('gallery-media')
        .getPublicUrl(filePath);

      // Insert reel record
      const { data: reelData, error: reelError } = await supabase
        .from('gallery')
        .insert({
          media_url: urlData.publicUrl,
          media_type: 'video',
          item_type: 'reel',
          caption: trimmedCaption || null,
          is_approved: true, // Auto-approve reels (or set to false for moderation)
          member_id: profile.id,
        })
        .select()
        .single();

      if (reelError) throw reelError;

      // Success
      Alert.alert(
        'Success',
        'Your reel has been posted successfully!',
        [
          {
            text: 'View Reels',
            onPress: () => navigation.navigate('Gallery', { screen: 'Reels' }),
          },
        ]
      );
    } catch (error) {
      console.error('Error uploading reel:', error);
      Alert.alert('Error', 'Failed to upload reel. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!selectedVideo) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Opening camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="close" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Reel</Text>
        <View style={styles.closeButton} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Video Preview */}
        <View style={styles.videoPreviewContainer}>
          <View style={styles.videoPreview}>
            <Icon name="videocam" size={64} color={colors.primary} />
            <Text style={styles.videoText}>Video ready to upload</Text>
            <Text style={styles.videoInfo}>
              Duration: {Math.round(selectedVideo.duration || 0)}s
            </Text>
            {selectedVideo.fileSize && (
              <Text style={styles.videoInfo}>
                Size: {(selectedVideo.fileSize / (1024 * 1024)).toFixed(1)}MB
              </Text>
            )}
          </View>
        </View>

        {/* Caption Input */}
        <View style={styles.captionContainer}>
          <Text style={styles.label}>Caption (Optional)</Text>
          <TextInput
            style={styles.captionInput}
            placeholder="Describe your reel..."
            placeholderTextColor={colors.textTertiary}
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={150}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{caption.length}/150</Text>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Icon name="information-circle-outline" size={20} color={colors.info} />
          <Text style={styles.infoText}>
            Reels are short vertical videos up to 60 seconds. They appear in a dedicated Reels feed.
          </Text>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.footer}>
        <Button
          title="Post Reel"
          onPress={handleUploadReel}
          loading={uploading}
          disabled={uploading}
          variant="primary"
          style={styles.button}
        />
        <Button
          title="Choose Different Video"
          onPress={promptVideoSource}
          variant="secondary"
          disabled={uploading}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  videoPreviewContainer: {
    aspectRatio: 9 / 16,
    maxHeight: 400,
    backgroundColor: colors.backgroundElevated,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  videoPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  videoText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
  },
  videoInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  captionContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  captionInput: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  charCount: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.info + '20',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  button: {
    width: '100%',
  },
});
