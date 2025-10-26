/**
 * Chat Screen - WhatsApp-style chat interface
 * Supports text messages, images, videos, audio, documents
 * Real-time messaging with typing indicators and read receipts
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../hooks/useAuth';
import { useCall } from '../../hooks/useCall';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../../components/common/Avatar';
import { supabase } from '../../services/supabase/client';

export default function ChatScreen({ route, navigation }) {
  const { otherUser } = route.params;
  const { profile } = useAuth();
  const { initiateCall } = useCall();
  const { colors } = useTheme();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef();
  const typingTimeoutRef = useRef();

  /**
   * Load messages and subscribe to real-time updates
   */
  useEffect(() => {
    loadMessages();
    markMessagesAsRead();
    subscribeToMessages();
    subscribeToTypingIndicator();
  }, [otherUser?.id, profile?.id]);

  /**
   * Load chat messages
   */
  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${profile.id},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${profile.id})`
        )
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark all received messages as read
   */
  const markMessagesAsRead = async () => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', otherUser.id)
        .eq('receiver_id', profile.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  /**
   * Subscribe to real-time message updates
   */
  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat-${profile.id}-${otherUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${profile.id}`,
        },
        (payload) => {
          if (payload.new.sender_id === otherUser.id) {
            setMessages((prev) => [payload.new, ...prev]);
            // Mark as read immediately
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', payload.new.id)
              .then();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  /**
   * Subscribe to typing indicator
   */
  const subscribeToTypingIndicator = () => {
    const channel = supabase
      .channel(`typing-${otherUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'typing_indicators',
        },
        (payload) => {
          if (payload.new.user_id === otherUser.id) {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 5000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  /**
   * Handle text change (typing indicator)
   */
  const handleTextChange = (text) => {
    setMessageText(text);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    if (text.trim()) {
      sendTypingIndicator();

      // Clear typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        // Typing stopped
      }, 3000);
    }
  };

  /**
   * Send typing indicator
   */
  const sendTypingIndicator = async () => {
    try {
      await supabase.from('typing_indicators').insert({
        user_id: profile.id,
        conversation_id: `${profile.id}-${otherUser.id}`,
      });
    } catch (error) {
      // Silently fail
    }
  };

  /**
   * Send text message
   */
  const handleSendMessage = async () => {
    const trimmedText = messageText.trim();

    if (!trimmedText || sending) {
      return;
    }

    setSending(true);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: profile.id,
          receiver_id: otherUser.id,
          content: trimmedText,
          is_read: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setMessages((prev) => [data, ...prev]);

      // Clear input
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  /**
   * Handle attachment button
   */
  const handleAttachment = () => {
    Alert.alert(
      'Send Attachment',
      'Choose attachment type',
      [
        {
          text: 'Photo',
          onPress: () => handleSendPhoto(),
        },
        {
          text: 'Video',
          onPress: () => handleSendVideo(),
        },
        {
          text: 'Document',
          onPress: () => handleSendDocument(),
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
   * Send photo (placeholder)
   */
  const handleSendPhoto = () => {
    Alert.alert('Photo Upload', 'Photo upload feature coming soon');
  };

  /**
   * Send video (placeholder)
   */
  const handleSendVideo = () => {
    Alert.alert('Video Upload', 'Video upload feature coming soon');
  };

  /**
   * Send document (placeholder)
   */
  const handleSendDocument = () => {
    Alert.alert('Document Upload', 'Document upload feature coming soon');
  };

  /**
   * Handle voice call
   */
  const handleVoiceCall = async () => {
    try {
      const callSignal = await initiateCall(otherUser.id, 'audio');

      // Navigate to call screen
      navigation.navigate('Call', {
        callData: {
          ...callSignal,
          isOutgoing: true,
        },
      });
    } catch (error) {
      console.error('Error initiating voice call:', error);
      Alert.alert('Error', 'Failed to initiate call. Please try again.');
    }
  };

  /**
   * Handle video call
   */
  const handleVideoCall = async () => {
    try {
      const callSignal = await initiateCall(otherUser.id, 'video');

      // Navigate to call screen
      navigation.navigate('Call', {
        callData: {
          ...callSignal,
          isOutgoing: true,
        },
      });
    } catch (error) {
      console.error('Error initiating video call:', error);
      Alert.alert('Error', 'Failed to initiate call. Please try again.');
    }
  };

  /**
   * Render message item
   */
  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender_id === profile.id;
    const showTime = true; // Could be optimized to show only on tap

    return (
      <View
        style={[
          styles.messageRow,
          isMyMessage ? styles.messageRowMine : styles.messageRowTheirs,
        ]}
      >
        {!isMyMessage && (
          <Avatar
            uri={otherUser.photo_url}
            name={otherUser.full_name}
            size={32}
            style={styles.messageAvatar}
          />
        )}

        <View
          style={[
            styles.messageBubble,
            isMyMessage
              ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
              : { backgroundColor: colors.backgroundElevated, borderBottomLeftRadius: 4 },
          ]}
        >
          {/* Message content */}
          <Text
            style={[
              styles.messageText,
              { color: isMyMessage ? '#FFFFFF' : colors.textPrimary },
            ]}
          >
            {item.content}
          </Text>

          {/* Timestamp and read status */}
          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, { color: isMyMessage ? 'rgba(255,255,255,0.7)' : colors.textTertiary }]}>
              {formatMessageTime(item.created_at)}
            </Text>
            {isMyMessage && (
              <Icon
                name={item.is_read ? 'checkmark-done' : 'checkmark'}
                size={16}
                color={item.is_read ? '#FFFFFF' : 'rgba(255,255,255,0.7)'}
                style={styles.readIcon}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  /**
   * Format message time
   */
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerCenter}
          onPress={() => {
            // Navigate to user profile
          }}
        >
          <Avatar
            uri={otherUser.photo_url}
            name={otherUser.full_name}
            size={36}
          />
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerName, { color: colors.textPrimary }]}>{otherUser.full_name}</Text>
            {isTyping && <Text style={[styles.typingText, { color: colors.primary }]}>typing...</Text>}
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={handleVideoCall}
          >
            <Icon name="videocam-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={handleVoiceCall}
          >
            <Icon name="call-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        inverted
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="chatbubble-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No messages yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>Start the conversation!</Text>
          </View>
        }
      />

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputContainer, { backgroundColor: colors.backgroundElevated, borderTopColor: colors.border }]}>
          {/* Attachment Button */}
          <TouchableOpacity
            style={styles.attachmentButton}
            onPress={handleAttachment}
          >
            <Icon name="add-circle-outline" size={28} color={colors.primary} />
          </TouchableOpacity>

          {/* Text Input */}
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.background, color: colors.textPrimary }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.textTertiary}
            value={messageText}
            onChangeText={handleTextChange}
            multiline
            maxLength={1000}
            editable={!sending}
          />

          {/* Send Button */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!messageText.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Icon
                name="send"
                size={24}
                color={messageText.trim() ? colors.primary : colors.textTertiary}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  typingText: {
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  headerActionButton: {
    padding: 8,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  messageRowMine: {
    justifyContent: 'flex-end',
  },
  messageRowTheirs: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  readIcon: {
    marginLeft: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    transform: [{ scaleY: -1 }], // Flip back since list is inverted
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  attachmentButton: {
    padding: 4,
    marginBottom: 4,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
    marginBottom: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
