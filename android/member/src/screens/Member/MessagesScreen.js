/**
 * Messages Screen - WhatsApp-style conversation list
 * Shows all conversations with last message, unread count, typing indicators
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../../components/common/Avatar';
import colors from '../../constants/colors';
import { supabase } from '../../services/supabase';

export default function MessagesScreen({ navigation }) {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Load conversations
   */
  useEffect(() => {
    loadConversations();
    subscribeToMessages();
  }, [profile?.id]);

  /**
   * Filter conversations based on search
   */
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = conversations.filter((conv) =>
        conv.otherUser?.full_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  /**
   * Load all conversations
   */
  const loadConversations = async () => {
    try {
      if (!profile?.id) return;

      // Get all messages where user is sender or receiver
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:members!messages_sender_id_fkey(id, full_name, photo_url),
          receiver:members!messages_receiver_id_fkey(id, full_name, photo_url)
        `)
        .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation (other user)
      const conversationsMap = {};

      messages?.forEach((message) => {
        const isUserSender = message.sender_id === profile.id;
        const otherUserId = isUserSender ? message.receiver_id : message.sender_id;
        const otherUser = isUserSender ? message.receiver : message.sender;

        if (!conversationsMap[otherUserId]) {
          conversationsMap[otherUserId] = {
            otherUser,
            lastMessage: message,
            unreadCount: 0,
            messages: [],
          };
        }

        conversationsMap[otherUserId].messages.push(message);

        // Count unread messages (received messages that are not read)
        if (!isUserSender && !message.is_read) {
          conversationsMap[otherUserId].unreadCount += 1;
        }
      });

      // Convert to array and sort by last message time
      const conversationsArray = Object.values(conversationsMap).sort(
        (a, b) =>
          new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at)
      );

      setConversations(conversationsArray);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Subscribe to real-time message updates
   */
  const subscribeToMessages = () => {
    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          // Reload conversations when new message arrives
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  /**
   * Handle refresh
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadConversations();
  }, []);

  /**
   * Handle conversation tap
   */
  const handleConversationPress = (conversation) => {
    navigation.navigate('Chat', {
      otherUser: conversation.otherUser,
    });
  };

  /**
   * Handle new message button
   */
  const handleNewMessage = () => {
    navigation.navigate('NewMessage');
  };

  /**
   * Render conversation item
   */
  const renderConversation = ({ item }) => {
    const lastMessage = item.lastMessage;
    const isUserSender = lastMessage.sender_id === profile?.id;

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <Avatar
          uri={item.otherUser?.photo_url}
          name={item.otherUser?.full_name}
          size={56}
        />

        {/* Content */}
        <View style={styles.conversationContent}>
          {/* Name and timestamp */}
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName} numberOfLines={1}>
              {item.otherUser?.full_name}
            </Text>
            <Text style={styles.conversationTime}>
              {formatMessageTime(lastMessage.created_at)}
            </Text>
          </View>

          {/* Last message preview */}
          <View style={styles.conversationFooter}>
            <Text
              style={[
                styles.conversationMessage,
                item.unreadCount > 0 && styles.conversationMessageUnread,
              ]}
              numberOfLines={1}
            >
              {isUserSender && (
                <Text style={styles.youPrefix}>You: </Text>
              )}
              {getMessagePreview(lastMessage)}
            </Text>
          </View>
        </View>

        {/* Unread badge */}
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>
              {item.unreadCount > 99 ? '99+' : item.unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  /**
   * Get message preview text
   */
  const getMessagePreview = (message) => {
    if (message.content) {
      return message.content;
    }
    // Handle media messages
    if (message.media_url) {
      if (message.media_type === 'image') return '📷 Photo';
      if (message.media_type === 'video') return '🎥 Video';
      if (message.media_type === 'audio') return '🎵 Audio';
      if (message.media_type === 'document') return '📄 Document';
    }
    return 'Message';
  };

  /**
   * Format message timestamp
   */
  const formatMessageTime = (timestamp) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[messageDate.getDay()];
    }
    return messageDate.toLocaleDateString();
  };

  /**
   * Render empty state
   */
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="chatbubbles-outline" size={80} color={colors.textTertiary} />
      <Text style={styles.emptyText}>No messages yet</Text>
      <Text style={styles.emptySubtext}>
        Start a conversation with other members
      </Text>
      <TouchableOpacity
        style={styles.newMessageButton}
        onPress={handleNewMessage}
      >
        <Text style={styles.newMessageButtonText}>New Message</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity
          style={styles.newMessageIcon}
          onPress={handleNewMessage}
        >
          <Icon name="create-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon
          name="search-outline"
          size={20}
          color={colors.textTertiary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.otherUser.id}
        renderItem={renderConversation}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={
          filteredConversations.length === 0 && styles.emptyListContent
        }
      />
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  newMessageIcon: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  conversationTime: {
    fontSize: 12,
    color: colors.textTertiary,
    marginLeft: 8,
  },
  conversationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversationMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  conversationMessageUnread: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  youPrefix: {
    color: colors.textTertiary,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyListContent: {
    flex: 1,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 8,
    textAlign: 'center',
  },
  newMessageButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  newMessageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
