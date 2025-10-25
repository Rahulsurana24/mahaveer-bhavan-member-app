/**
 * WebRTC Service
 * Complete WebRTC implementation for peer-to-peer audio/video calling
 */

import { mediaDevices, RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';

// STUN/TURN servers for NAT traversal
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.isFrontCamera = true;
    this.listeners = {
      onLocalStream: null,
      onRemoteStream: null,
      onIceCandidate: null,
      onConnectionStateChange: null,
    };
  }

  /**
   * Initialize media streams (camera + microphone)
   */
  async initializeMediaStream(isVideoCall = true) {
    try {
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: isVideoCall
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30 },
              facingMode: this.isFrontCamera ? 'user' : 'environment',
            }
          : false,
      };

      const stream = await mediaDevices.getUserMedia(constraints);
      this.localStream = stream;

      if (this.listeners.onLocalStream) {
        this.listeners.onLocalStream(stream);
      }

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  /**
   * Create peer connection
   */
  createPeerConnection() {
    try {
      this.peerConnection = new RTCPeerConnection(ICE_SERVERS);

      // Add local stream tracks to peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          this.peerConnection.addTrack(track, this.localStream);
        });
      }

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.listeners.onIceCandidate) {
          this.listeners.onIceCandidate(event.candidate);
        }
      };

      // Handle remote stream
      this.peerConnection.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          this.remoteStream = event.streams[0];
          if (this.listeners.onRemoteStream) {
            this.listeners.onRemoteStream(event.streams[0]);
          }
        }
      };

      // Monitor connection state
      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection.connectionState;
        console.log('Connection state:', state);
        if (this.listeners.onConnectionStateChange) {
          this.listeners.onConnectionStateChange(state);
        }
      };

      return this.peerConnection;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      throw error;
    }
  }

  /**
   * Create offer (caller initiates)
   */
  async createOffer() {
    try {
      if (!this.peerConnection) {
        this.createPeerConnection();
      }

      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: this.localStream?.getVideoTracks().length > 0,
      });

      await this.peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  /**
   * Create answer (receiver responds)
   */
  async createAnswer(offer) {
    try {
      if (!this.peerConnection) {
        this.createPeerConnection();
      }

      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      throw error;
    }
  }

  /**
   * Set remote description (caller receives answer)
   */
  async setRemoteDescription(answer) {
    try {
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    } catch (error) {
      console.error('Error setting remote description:', error);
      throw error;
    }
  }

  /**
   * Add ICE candidate
   */
  async addIceCandidate(candidate) {
    try {
      if (this.peerConnection && candidate) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  /**
   * Toggle microphone
   */
  toggleMute() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled; // Return new muted state
      }
    }
    return false;
  }

  /**
   * Toggle video
   */
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled; // Return new video enabled state
      }
    }
    return false;
  }

  /**
   * Switch camera (front/back)
   */
  async switchCamera() {
    try {
      if (this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
          // Toggle camera facing mode
          this.isFrontCamera = !this.isFrontCamera;
          await videoTrack._switchCamera();
          return this.isFrontCamera;
        }
      }
    } catch (error) {
      console.error('Error switching camera:', error);
      throw error;
    }
  }

  /**
   * Enable speaker
   */
  async enableSpeaker(enable = true) {
    try {
      // This is handled automatically in react-native-webrtc
      // Audio routes to speaker for video calls, earpiece for audio calls
      console.log('Speaker:', enable ? 'enabled' : 'disabled');
    } catch (error) {
      console.error('Error toggling speaker:', error);
    }
  }

  /**
   * Get local stream
   */
  getLocalStream() {
    return this.localStream;
  }

  /**
   * Get remote stream
   */
  getRemoteStream() {
    return this.remoteStream;
  }

  /**
   * Set event listeners
   */
  setListeners(listeners) {
    this.listeners = { ...this.listeners, ...listeners };
  }

  /**
   * Cleanup - close connections and release media
   */
  cleanup() {
    try {
      // Stop all tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop());
        this.localStream = null;
      }

      if (this.remoteStream) {
        this.remoteStream.getTracks().forEach((track) => track.stop());
        this.remoteStream = null;
      }

      // Close peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      // Reset listeners
      this.listeners = {
        onLocalStream: null,
        onRemoteStream: null,
        onIceCandidate: null,
        onConnectionStateChange: null,
      };
    } catch (error) {
      console.error('Error cleaning up WebRTC:', error);
    }
  }
}

// Singleton instance
const webRTCService = new WebRTCService();
export default webRTCService;
