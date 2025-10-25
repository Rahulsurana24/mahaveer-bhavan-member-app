/**
 * Create Story Screen - Upload stories (24-hour content)
 * Quick upload flow for stories
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import colors from '../../constants/colors';
import { supabase } from '../../services/supabase';

export default function CreateStoryScreen({ navigation }) {
  const { profile } = useAuth();
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [uploading, setUploading] = useState(false);

  /**
   * Choose media source on mount
   */
  React.useEffect(() => {
    promptMediaSource();
  }, []);

  /**
   * Prompt user to choose media source
   */
  const promptMediaSource = () => {
    Alert.alert(
      'Create Story',
      'Choose how to create your story',
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
          onPress: () => navigation.goBack(),
        },
      ],
      { cancelable: false }
    );
  };

  /**
   * Open camera
   */
  const openCamera = async () => {
    try {
      const { launchCamera } = require('react-native-image-picker');

      const options = {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1080,
        maxHeight: 1920,
      };

      launchCamera(options, (response) => {
        if (response.didCancel) {
          navigation.goBack();
          return;
        }

        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Failed to open camera');
          navigation.goBack();
          return;
        }

        if (response.assets && response.assets[0]) {
          setSelectedMedia(response.assets[0]);
        }
      });
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera. Please check permissions.');
      navigation.goBack();
    }
  };

  /**
   * Open gallery
   */
  const openGallery = async () => {
    try {
      const { launchImageLibrary } = require('react-native-image-picker');

      const options = {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1080,
        maxHeight: 1920,
      };

      launchImageLibrary(options, (response) => {
        if (response.didCancel) {
          navigation.goBack();
          return;
        }

        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Failed to open gallery');
          navigation.goBack();
          return;
        }

        if (response.assets && response.assets[0]) {
          setSelectedMedia(response.assets[0]);
        }
      });
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery. Please check permissions.');
      navigation.goBack();
    }
  };

  /**
   * Upload story
   */
  const handleUploadStory = async () => {
    if (!selectedMedia) {
      Alert.alert('Error', 'Please select a photo');
      return;
    }

    if (!profile?.id) {
      Alert.alert('Error', 'You must be logged in to post stories');
      return;
    }

    setUploading(true);

    try {
      // Generate file path
      const fileExt = selectedMedia.fileName?.split('.').pop() || 'jpg';
      const fileName = `${profile.id}_${Date.now()}.${fileExt}`;
      const filePath = `stories/${fileName}`;

      // Prepare form data
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? selectedMedia.uri : selectedMedia.uri.replace('file://', ''),
        type: selectedMedia.type || 'image/jpeg',
        name: fileName,
      });

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery-media')
        .upload(filePath, formData, {
          contentType: selectedMedia.type || 'image/jpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('gallery-media')
        .getPublicUrl(filePath);

      // Insert story record (24-hour content)
      const { data: storyData, error: storyError } = await supabase
        .from('gallery')
        .insert({
          media_url: urlData.publicUrl,
          media_type: 'image',
          item_type: 'story',
          is_approved: true, // Stories are auto-approved
          member_id: profile.id,
          caption: null,
        })
        .select()
        .single();

      if (storyError) throw storyError;

      // Success
      Alert.alert(
        'Success',
        'Your story has been posted! It will be visible for 24 hours.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Gallery'),
          },
        ]
      );
    } catch (error) {
      console.error('Error uploading story:', error);
      Alert.alert('Error', 'Failed to upload story. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!selectedMedia) {
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
        <Text style={styles.headerTitle}>Create Story</Text>
        <View style={styles.closeButton} />
      </View>

      {/* Preview */}
      <View style={styles.previewContainer}>
        <Image
          source={{ uri: selectedMedia.uri }}
          style={styles.preview}
          resizeMode="cover"
        />
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Icon name="time-outline" size={24} color={colors.primary} />
        <Text style={styles.infoText}>
          Your story will be visible for 24 hours
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Button
          title="Post Story"
          onPress={handleUploadStory}
          loading={uploading}
          disabled={uploading}
          variant="primary"
          style={styles.button}
        />
        <Button
          title="Change Photo"
          onPress={promptMediaSource}
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
  previewContainer: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  button: {
    width: '100%',
  },
});
