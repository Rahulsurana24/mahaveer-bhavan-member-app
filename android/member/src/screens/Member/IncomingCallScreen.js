/**
 * Incoming Call Screen - Shows incoming call notification
 * Full-screen modal with answer/decline options
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useCall } from '../../hooks/useCall';
import colors from '../../constants/colors';

export default function IncomingCallScreen({ route, navigation }) {
  const { callData } = route.params;
  const { answerCall, declineCall } = useCall();
  const [isAnswering, setIsAnswering] = useState(false);

  const caller = callData?.caller;
  const isVideoCall = callData?.call_type === 'video';

  /**
   * Handle answer call
   */
  const handleAnswer = async () => {
    setIsAnswering(true);
    try {
      await answerCall(callData.id);

      // Navigate to call screen
      navigation.replace('Call', {
        callData: {
          ...callData,
          isOutgoing: false,
        },
      });
    } catch (error) {
      console.error('Error answering call:', error);
      setIsAnswering(false);
    }
  };

  /**
   * Handle decline call
   */
  const handleDecline = async () => {
    try {
      await declineCall(callData.id);
      navigation.goBack();
    } catch (error) {
      console.error('Error declining call:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#0F766E', '#134E4A']}
      style={styles.container}
    >
      <SafeAreaView style={styles.content}>
        {/* Caller Info */}
        <View style={styles.callerSection}>
          {/* Profile Image */}
          {caller?.photo_url ? (
            <Image
              source={{ uri: caller.photo_url }}
              style={styles.profileImage}
            />
          ) : (
            <View style={[styles.profileImage, styles.profilePlaceholder]}>
              <Text style={styles.profileInitial}>
                {caller?.full_name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
          )}

          {/* Caller Name */}
          <Text style={styles.callerName}>
            {caller?.full_name || 'Unknown Caller'}
          </Text>

          {/* Call Type */}
          <View style={styles.callTypeContainer}>
            <Icon
              name={isVideoCall ? 'videocam' : 'call'}
              size={20}
              color={colors.textPrimary}
            />
            <Text style={styles.callType}>
              Incoming {isVideoCall ? 'Video' : 'Voice'} Call
            </Text>
          </View>

          {/* Ringing Animation */}
          <View style={styles.ringingContainer}>
            <Animated.View style={styles.ripple1} />
            <Animated.View style={styles.ripple2} />
            <Animated.View style={styles.ripple3} />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Decline Button */}
          <TouchableOpacity
            style={styles.declineButton}
            onPress={handleDecline}
            activeOpacity={0.7}
          >
            <Icon name="close" size={36} color={colors.textPrimary} />
            <Text style={styles.actionLabel}>Decline</Text>
          </TouchableOpacity>

          {/* Answer Button */}
          <TouchableOpacity
            style={styles.answerButton}
            onPress={handleAnswer}
            disabled={isAnswering}
            activeOpacity={0.7}
          >
            <Icon name="call" size={36} color={colors.textPrimary} />
            <Text style={styles.actionLabel}>
              {isAnswering ? 'Connecting...' : 'Answer'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  callerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 24,
  },
  profilePlaceholder: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 56,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  callerName: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  callTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  callType: {
    fontSize: 18,
    color: colors.textPrimary,
    opacity: 0.9,
  },
  ringingContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ripple1: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  ripple2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  ripple3: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  declineButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
});
