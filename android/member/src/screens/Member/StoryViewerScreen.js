/**
 * Story Viewer Screen - Full-screen Instagram-style story viewer
 * Features progress bars, tap navigation, auto-advance
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Avatar from '../../components/common/Avatar';
import colors from '../../constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds per story

export default function StoryViewerScreen({ route, navigation }) {
  const { stories, initialIndex = 0 } = route.params;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const progressAnims = useRef(stories.map(() => new Animated.Value(0))).current;
  const timerRef = useRef(null);

  const currentStory = stories[currentIndex];

  /**
   * Start story progress animation
   */
  useEffect(() => {
    if (!isPaused) {
      startStoryProgress();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex, isPaused]);

  /**
   * Animate progress bar
   */
  const startStoryProgress = () => {
    // Reset current progress
    progressAnims[currentIndex].setValue(0);

    // Animate to full
    Animated.timing(progressAnims[currentIndex], {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !isPaused) {
        goToNext();
      }
    });
  };

  /**
   * Go to next story
   */
  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // End of stories, close viewer
      navigation.goBack();
    }
  };

  /**
   * Go to previous story
   */
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      // Already at first story, close viewer
      navigation.goBack();
    }
  };

  /**
   * Handle tap on left or right side
   */
  const handleTap = (x) => {
    const tapPosition = x / SCREEN_WIDTH;

    if (tapPosition < 0.33) {
      // Tap on left side - previous
      goToPrevious();
    } else if (tapPosition > 0.66) {
      // Tap on right side - next
      goToNext();
    }
  };

  /**
   * Format timestamp
   */
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / 60000);
      return `${diffMins}m ago`;
    }
    return `${diffHours}h ago`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Story Image/Video */}
      <Image
        source={{ uri: currentStory.media_url }}
        style={styles.storyMedia}
        resizeMode="cover"
      />

      {/* Overlay Gradient */}
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.3)']}
        style={styles.gradient}
      />

      {/* Tap Areas for Navigation */}
      <View style={styles.tapContainer}>
        <TouchableOpacity
          style={styles.tapLeft}
          activeOpacity={1}
          onPress={(e) => handleTap(e.nativeEvent.pageX)}
          onLongPress={() => setIsPaused(true)}
          onPressOut={() => setIsPaused(false)}
        />
        <TouchableOpacity
          style={styles.tapRight}
          activeOpacity={1}
          onPress={(e) => handleTap(e.nativeEvent.pageX)}
          onLongPress={() => setIsPaused(true)}
          onPressOut={() => setIsPaused(false)}
        />
      </View>

      {/* Top Section */}
      <SafeAreaView style={styles.topSection} edges={['top']}>
        {/* Progress Bars */}
        <View style={styles.progressContainer}>
          {stories.map((_, index) => (
            <View key={index} style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground} />
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: progressAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor:
                      index < currentIndex
                        ? colors.textPrimary
                        : index === currentIndex
                        ? colors.textPrimary
                        : 'transparent',
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Story Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar
              uri={currentStory.uploader?.photo_url}
              name={currentStory.uploader?.full_name}
              size={40}
              style={styles.avatar}
            />
            <View style={styles.headerText}>
              <Text style={styles.username}>
                {currentStory.uploader?.full_name}
              </Text>
              <Text style={styles.timestamp}>
                {formatTimeAgo(currentStory.created_at)}
              </Text>
            </View>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Caption (if exists) */}
      {currentStory.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.captionText}>{currentStory.caption}</Text>
        </View>
      )}

      {/* Pause Indicator */}
      {isPaused && (
        <View style={styles.pauseIndicator}>
          <Icon name="pause" size={64} color="rgba(255,255,255,0.8)" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  storyMedia: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  tapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  tapLeft: {
    flex: 1,
  },
  tapRight: {
    flex: 2,
  },
  topSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 8,
    gap: 4,
  },
  progressBarContainer: {
    flex: 1,
    height: 3,
    position: 'relative',
  },
  progressBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1.5,
  },
  progressBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 3,
    borderRadius: 1.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    borderWidth: 2,
    borderColor: colors.textPrimary,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textPrimary,
    opacity: 0.8,
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionContainer: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
  },
  captionText: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  pauseIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -32,
    marginTop: -32,
  },
});
