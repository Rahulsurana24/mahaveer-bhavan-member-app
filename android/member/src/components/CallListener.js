/**
 * CallListener
 * Global component that listens for incoming calls and shows IncomingCallScreen
 * Should be mounted at root level to work app-wide
 */

import React, { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useCall } from '../hooks/useCall';

export default function CallListener() {
  const navigation = useNavigation();
  const { incomingCall } = useCall();
  const previousCallId = useRef(null);

  useEffect(() => {
    // When an incoming call is detected, show the IncomingCallScreen
    if (incomingCall && incomingCall.id !== previousCallId.current) {
      previousCallId.current = incomingCall.id;

      // Navigate to IncomingCall screen
      navigation.navigate('IncomingCall', {
        callData: incomingCall
      });
    }
  }, [incomingCall, navigation]);

  // This is a listener component, it doesn't render anything
  return null;
}
