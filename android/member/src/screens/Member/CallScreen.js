/**
 * Call Screen - Active voice/video call interface with WebRTC
 * Displays real-time video streams and call controls
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { RTCView } from 'react-native-webrtc';
import { useCall } from '../../hooks/useCall';
import colors from '../../constants/colors';

const { width, height } = Dimensions.get('window');

export default function CallScreen({ route, navigation }) {
  const { callData } = route.params;
  const {
    activeCall,
    localStream,
    remoteStream,
    isMuted,
    isVideoEnabled,
    isSpeakerEnabled,
    endCall,
    toggleMute,
    toggleVideo,
    switchCamera,
    toggleSpeaker,
  } = useCall();

  const [callDuration, setCallDuration] = useState(0);

  // Get other party details
  const otherParty = callData?.isOutgoing ? callData?.receiver : callData?.caller;
  const isVideoCall = callData?.call_type === 'video';

  /**
   * Update call duration every second
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeCall?.startTime) {
        const duration = Math.floor((new Date() - new Date(activeCall.startTime)) / 1000);
        setCallDuration(duration);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCall]);

  /**
   * Handle call end
   */
  const handleEndCall = async () => {
    await endCall();
    navigation.goBack();
  };

  /**
   * Handle mute toggle
   */
  const handleToggleMute = () => {
    toggleMute();
  };

  /**
   * Handle video toggle
   */
  const handleToggleVideo = () => {
    toggleVideo();
  };

  /**
   * Handle speaker toggle
   */
  const handleToggleSpeaker = () => {
    toggleSpeaker();
  };

  /**
   * Handle camera switch
   */
  const handleSwitchCamera = () => {
    switchCamera();
  };

  /**
   * Format call duration
   */
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Video Call Interface */}
      {isVideoCall && isVideoEnabled ? (
        <View style={styles.videoContainer}>
          {/* Remote video stream */}
          {remoteStream ? (
            <RTCView
              style={styles.remoteVideo}
              streamURL={remoteStream.toURL()}
              objectFit="cover"
              zOrder={0}
            />
          ) : (
            <View style={styles.remoteVideo}>
              <Text style={styles.videoPlaceholder}>Connecting...</Text>
            </View>
          )}

          {/* Local video preview */}
          <View style={styles.localVideoPreview}>
            {localStream ? (
              <RTCView
                style={styles.localVideo}
                streamURL={localStream.toURL()}
                objectFit="cover"
                mirror={true}
                zOrder={1}
              />
            ) : (
              <View style={styles.localVideo}>
                <Text style={styles.localVideoText}>You</Text>
              </View>
            )}

            {/* Camera switch button */}
            <TouchableOpacity
              style={styles.cameraSwitchButton}
              onPress={handleSwitchCamera}
            >
              <Icon name="camera-reverse-outline" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Audio call interface */
        <LinearGradient
          colors={['#0F766E', '#134E4A']}
          style={styles.audioBackground}
        >
          <SafeAreaView style={styles.audioContent}>
            {/* Profile Image */}
            <View style={styles.profileSection}>
              {otherParty?.photo_url ? (
                <Image
                  source={{ uri: otherParty.photo_url }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={[styles.profileImage, styles.profilePlaceholder]}>
                  <Text style={styles.profileInitial}>
                    {otherParty?.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </Text>
                </View>
              )}

              <Text style={styles.callerName}>{otherParty?.full_name || 'Unknown'}</Text>

              {/* Call Status */}
              <Text style={styles.callStatus}>
                {activeCall?.status === 'ringing'
                  ? 'Ringing...'
                  : formatDuration(callDuration)}
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      )}

      {/* Call Controls */}
      <SafeAreaView style={styles.controlsContainer} edges={['bottom']}>
        {/* Top info for video calls */}
        {isVideoCall && (
          <View style={styles.videoCallInfo}>
            <Text style={styles.videoCallerName}>
              {otherParty?.full_name || 'Unknown'}
            </Text>
            <Text style={styles.videoCallDuration}>
              {formatDuration(callDuration)}
            </Text>
          </View>
        )}

        {/* Control Buttons */}
        <View style={styles.controlButtons}>
          {/* Mute Button */}
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={handleToggleMute}
          >
            <Icon
              name={isMuted ? 'mic-off' : 'mic'}
              size={28}
              color={colors.textPrimary}
            />
            <Text style={styles.controlLabel}>
              {isMuted ? 'Unmute' : 'Mute'}
            </Text>
          </TouchableOpacity>

          {/* Speaker Button (audio calls only) */}
          {!isVideoCall && (
            <TouchableOpacity
              style={[styles.controlButton, isSpeakerEnabled && styles.controlButtonActive]}
              onPress={handleToggleSpeaker}
            >
              <Icon
                name={isSpeakerEnabled ? 'volume-high' : 'volume-low'}
                size={28}
                color={colors.textPrimary}
              />
              <Text style={styles.controlLabel}>Speaker</Text>
            </TouchableOpacity>
          )}

          {/* Video Toggle (video calls only) */}
          {isVideoCall && (
            <TouchableOpacity
              style={[styles.controlButton, !isVideoEnabled && styles.controlButtonActive]}
              onPress={handleToggleVideo}
            >
              <Icon
                name={isVideoEnabled ? 'videocam' : 'videocam-off'}
                size={28}
                color={colors.textPrimary}
              />
              <Text style={styles.controlLabel}>Video</Text>
            </TouchableOpacity>
          )}

          {/* End Call Button */}
          <TouchableOpacity
            style={styles.endCallButton}
            onPress={handleEndCall}
          >
            <Icon name="call" size={32} color={colors.textPrimary} />
            <Text style={styles.controlLabel}>End</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  localVideoPreview: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  localVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  localVideoText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cameraSwitchButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioBackground: {
    flex: 1,
  },
  audioContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 60,
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
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 18,
    color: colors.textPrimary,
    opacity: 0.8,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  videoCallInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  videoCallerName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  videoCallDuration: {
    fontSize: 14,
    color: colors.textSecondary,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  controlButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: colors.primary,
  },
  controlLabel: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 6,
    textAlign: 'center',
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
