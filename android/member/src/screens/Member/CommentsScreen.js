/**
 * Comments Screen - Full-screen modal for viewing and posting comments
 * Supports real-time updates using Supabase Realtime
 */

import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../../components/common/Avatar';
import { supabase } from '../../services/supabase/client';

export default function CommentsScreen({ route, navigation }) {
  const { postId } = route.params;
  const { profile } = useAuth();
  const { colors } = useTheme();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const flatListRef = useRef();

  /**
   * Load comments and subscribe to real-time updates
   */
  useEffect(() => {
    loadComments();

    // Subscribe to real-time comments
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'gallery_comments',
          filter: `gallery_item_id=eq.${postId}`,
        },
        (payload) => {
          // Add new comment to list
          loadComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  /**
   * Load comments from database
   */
  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_comments')
        .select(`
          *,
          commenter:members!gallery_comments_member_id_fkey(id, full_name, photo_url)
        `)
        .eq('gallery_item_id', postId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setComments(data);
        // Scroll to bottom when new comments load
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Post new comment
   */
  const handlePostComment = async () => {
    const trimmedText = commentText.trim();

    if (!trimmedText) {
      return;
    }

    if (!profile?.id) {
      Alert.alert('Error', 'You must be logged in to post comments');
      return;
    }

    setPosting(true);

    try {
      const { data, error } = await supabase
        .from('gallery_comments')
        .insert({
          gallery_item_id: postId,
          member_id: profile.id,
          comment_text: trimmedText,
        })
        .select();

      if (error) throw error;

      // Clear input
      setCommentText('');

      // Reload comments to get the new one with commenter data
      await loadComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      Alert.alert('Error', 'Failed to post comment. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  /**
   * Render comment item
   */
  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <Avatar
        uri={item.commenter?.photo_url}
        name={item.commenter?.full_name}
        size={40}
      />
      <View style={styles.commentContent}>
        <View style={[styles.commentBubble, { backgroundColor: colors.backgroundElevated }]}>
          <Text style={[styles.commenterName, { color: colors.textPrimary }]}>{item.commenter?.full_name}</Text>
          <Text style={[styles.commentText, { color: colors.textPrimary }]}>{item.comment_text}</Text>
        </View>
        <Text style={[styles.commentTime, { color: colors.textTertiary }]}>{formatTimeAgo(item.created_at)}</Text>
      </View>
    </View>
  );

  /**
   * Render empty state
   */
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="chatbubble-outline" size={64} color={colors.textTertiary} />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No comments yet</Text>
      <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>Be the first to comment!</Text>
    </View>
  );

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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Comments</Text>
        <View style={styles.backButton} />
      </View>

      {/* Comments List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={renderComment}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            comments.length === 0 && styles.listContentEmpty,
          ]}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }}
        />
      )}

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputContainer, { backgroundColor: colors.backgroundElevated, borderTopColor: colors.border }]}>
          <Avatar
            uri={profile?.photo_url}
            name={profile?.full_name}
            size={36}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary }]}
            placeholder="Add a comment..."
            placeholderTextColor={colors.textTertiary}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
            editable={!posting}
          />
          <TouchableOpacity
            style={[
              styles.postButton,
              (!commentText.trim() || posting) && styles.postButtonDisabled,
            ]}
            onPress={handlePostComment}
            disabled={!commentText.trim() || posting}
          >
            {posting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Icon
                name="send"
                size={20}
                color={commentText.trim() ? colors.primary : colors.textTertiary}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/**
 * Format time ago
 */
function formatTimeAgo(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now - time;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return time.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flex: 1,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 4,
  },
  commenterName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentTime: {
    fontSize: 12,
    marginLeft: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  postButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
});
