/**
 * useCall Hook - Complete WebRTC call management
 * Handles call initiation, answering, declining, and full WebRTC integration
 */

import { useState, useEffect, useRef } from 'react';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { supabase } from '../services/supabase';
import { useAuth } from './useAuth';
import webRTCService from '../services/webrtc/WebRTCService';

export const useCall = () => {
  const { profile } = useAuth();
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(false);

  const callChannelRef = useRef(null);
  const signalingChannelRef = useRef(null);
  const currentCallIdRef = useRef(null);

  useEffect(() => {
    if (!profile?.id) return;

    // Subscribe to incoming calls
    subscribeToIncomingCalls();

    // Set up WebRTC listeners
    setupWebRTCListeners();

    return () => {
      cleanup();
    };
  }, [profile?.id]);

  /**
   * Set up WebRTC event listeners
   */
  const setupWebRTCListeners = () => {
    webRTCService.setListeners({
      onLocalStream: (stream) => {
        setLocalStream(stream);
      },
      onRemoteStream: (stream) => {
        setRemoteStream(stream);
      },
      onIceCandidate: async (candidate) => {
        // Send ICE candidate to remote peer via database
        if (currentCallIdRef.current) {
          try {
            await supabase.from('call_signals').insert({
              call_id: currentCallIdRef.current,
              caller_id: profile.id,
              receiver_id: activeCall?.isOutgoing
                ? activeCall.receiver_id
                : activeCall?.caller_id,
              signal_type: 'ice_candidate',
              signal_data: candidate,
              status: 'active',
            });
          } catch (error) {
            console.error('Error sending ICE candidate:', error);
          }
        }
      },
      onConnectionStateChange: (state) => {
        console.log('WebRTC connection state:', state);
        if (state === 'failed' || state === 'disconnected') {
          Alert.alert('Connection Lost', 'The call connection was lost.');
        }
      },
    });
  };

  /**
   * Request camera and microphone permissions
   */
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        const cameraGranted = grants['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED;
        const audioGranted = grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED;

        if (!cameraGranted || !audioGranted) {
          Alert.alert(
            'Permissions Required',
            'Camera and microphone permissions are required for calls.'
          );
          return false;
        }
        return true;
      } catch (error) {
        console.error('Permission error:', error);
        return false;
      }
    }
    return true; // iOS handles permissions differently
  };

  /**
   * Subscribe to incoming call signals
   */
  const subscribeToIncomingCalls = () => {
    const channel = supabase
      .channel(`calls:${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_signals',
          filter: `receiver_id=eq.${profile.id}`,
        },
        async (payload) => {
          const signal = payload.new;

          if (signal.signal_type === 'offer') {
            // Incoming call offer
            const { data: caller } = await supabase
              .from('members')
              .select('id, full_name, photo_url')
              .eq('id', signal.caller_id)
              .single();

            setIncomingCall({
              ...signal,
              caller,
            });
          } else if (signal.signal_type === 'answer' && currentCallIdRef.current === signal.call_id) {
            // Received answer to our offer
            await webRTCService.setRemoteDescription(signal.signal_data);
          } else if (signal.signal_type === 'ice_candidate' && currentCallIdRef.current === signal.call_id) {
            // Received ICE candidate
            await webRTCService.addIceCandidate(signal.signal_data);
          } else if (signal.signal_type === 'end' && currentCallIdRef.current === signal.call_id) {
            // Call ended by other party
            endCall(false);
          }
        }
      )
      .subscribe();

    callChannelRef.current = channel;
  };

  /**
   * Initiate a call
   */
  const initiateCall = async (receiverId, callType = 'audio') => {
    try {
      // Request permissions
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        throw new Error('Permissions not granted');
      }

      // Initialize media stream
      const isVideoCall = callType === 'video';
      await webRTCService.initializeMediaStream(isVideoCall);
      setIsVideoEnabled(isVideoCall);

      // Create call signal record
      const { data: callSignal, error } = await supabase
        .from('call_signals')
        .insert({
          caller_id: profile.id,
          receiver_id: receiverId,
          call_type: callType,
          signal_type: 'offer',
          status: 'ringing',
        })
        .select(`
          *,
          receiver:members!call_signals_receiver_id_fkey(id, full_name, photo_url)
        `)
        .single();

      if (error) throw error;

      currentCallIdRef.current = callSignal.id;

      // Create WebRTC offer
      const offer = await webRTCService.createOffer();

      // Update call signal with SDP offer
      await supabase
        .from('call_signals')
        .update({
          signal_data: offer,
        })
        .eq('id', callSignal.id);

      setActiveCall({
        ...callSignal,
        isOutgoing: true,
        startTime: new Date(),
      });

      return callSignal;
    } catch (error) {
      console.error('Error initiating call:', error);
      webRTCService.cleanup();
      throw error;
    }
  };

  /**
   * Answer incoming call
   */
  const answerCall = async (callSignalId) => {
    try {
      // Request permissions
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        throw new Error('Permissions not granted');
      }

      // Get call signal with offer
      const { data: callSignal, error: fetchError } = await supabase
        .from('call_signals')
        .select('*')
        .eq('id', callSignalId)
        .single();

      if (fetchError) throw fetchError;

      currentCallIdRef.current = callSignalId;

      // Initialize media stream
      const isVideoCall = callSignal.call_type === 'video';
      await webRTCService.initializeMediaStream(isVideoCall);
      setIsVideoEnabled(isVideoCall);

      // Create WebRTC answer
      const answer = await webRTCService.createAnswer(callSignal.signal_data);

      // Send answer back
      await supabase.from('call_signals').insert({
        call_id: callSignalId,
        caller_id: profile.id,
        receiver_id: callSignal.caller_id,
        signal_type: 'answer',
        signal_data: answer,
        status: 'active',
      });

      // Update original call signal status
      await supabase
        .from('call_signals')
        .update({ status: 'active' })
        .eq('id', callSignalId);

      setActiveCall({
        ...incomingCall,
        isOutgoing: false,
        startTime: new Date(),
      });

      setIncomingCall(null);

      return true;
    } catch (error) {
      console.error('Error answering call:', error);
      webRTCService.cleanup();
      throw error;
    }
  };

  /**
   * Decline incoming call
   */
  const declineCall = async (callSignalId) => {
    try {
      // Update call signal status
      await supabase
        .from('call_signals')
        .update({ status: 'declined' })
        .eq('id', callSignalId);

      // Send decline signal
      await supabase.from('call_signals').insert({
        call_id: callSignalId,
        caller_id: profile.id,
        receiver_id: incomingCall.caller_id,
        signal_type: 'end',
        status: 'declined',
      });

      setIncomingCall(null);
      return true;
    } catch (error) {
      console.error('Error declining call:', error);
      throw error;
    }
  };

  /**
   * End active call
   */
  const endCall = async (sendSignal = true) => {
    try {
      if (activeCall && sendSignal) {
        // Send end signal to other party
        await supabase.from('call_signals').insert({
          call_id: currentCallIdRef.current,
          caller_id: profile.id,
          receiver_id: activeCall.isOutgoing
            ? activeCall.receiver_id
            : activeCall.caller_id,
          signal_type: 'end',
          status: 'ended',
        });

        // Update original call signal
        await supabase
          .from('call_signals')
          .update({ status: 'ended' })
          .eq('id', currentCallIdRef.current);
      }

      // Cleanup WebRTC
      webRTCService.cleanup();

      // Reset state
      setActiveCall(null);
      setLocalStream(null);
      setRemoteStream(null);
      setIsMuted(false);
      setIsVideoEnabled(true);
      setIsSpeakerEnabled(false);
      currentCallIdRef.current = null;

      return true;
    } catch (error) {
      console.error('Error ending call:', error);
      // Cleanup anyway
      webRTCService.cleanup();
      setActiveCall(null);
      setLocalStream(null);
      setRemoteStream(null);
      currentCallIdRef.current = null;
      throw error;
    }
  };

  /**
   * Toggle mute
   */
  const toggleMute = () => {
    const muted = webRTCService.toggleMute();
    setIsMuted(muted);
    return muted;
  };

  /**
   * Toggle video
   */
  const toggleVideo = () => {
    const enabled = webRTCService.toggleVideo();
    setIsVideoEnabled(enabled);
    return enabled;
  };

  /**
   * Switch camera (front/back)
   */
  const switchCamera = async () => {
    try {
      await webRTCService.switchCamera();
    } catch (error) {
      console.error('Error switching camera:', error);
      Alert.alert('Error', 'Failed to switch camera');
    }
  };

  /**
   * Toggle speaker
   */
  const toggleSpeaker = async () => {
    try {
      const enabled = !isSpeakerEnabled;
      await webRTCService.enableSpeaker(enabled);
      setIsSpeakerEnabled(enabled);
      return enabled;
    } catch (error) {
      console.error('Error toggling speaker:', error);
    }
  };

  /**
   * Cleanup resources
   */
  const cleanup = () => {
    if (callChannelRef.current) {
      supabase.removeChannel(callChannelRef.current);
    }
    if (signalingChannelRef.current) {
      supabase.removeChannel(signalingChannelRef.current);
    }
    webRTCService.cleanup();
  };

  return {
    activeCall,
    incomingCall,
    localStream,
    remoteStream,
    isMuted,
    isVideoEnabled,
    isSpeakerEnabled,
    initiateCall,
    answerCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
    switchCamera,
    toggleSpeaker,
  };
};
