/**
 * Gallery Screen - Instagram-style with Feed, Stories, and Reels
 * Features:
 * - Stories: 24-hour disappearing content
 * - Feed: Posts with images/videos, likes, comments
 * - Reels: Short vertical videos
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../../components/common/Avatar';
import { supabase } from '../../services/supabase/client';
import { formatDate } from '../../../shared/src/utils/dateHelpers';

const Tab = createMaterialTopTabNavigator();
const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Main Gallery Screen with Tabs
 */
export default function GalleryScreen({ navigation }) {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Gallery</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => navigation.navigate('UploadMedia')}
        >
          <Icon name="add-circle-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: colors.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarIndicatorStyle: {
            backgroundColor: colors.primary,
            height: 3,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '600',
            textTransform: 'none',
          },
        }}
      >
        <Tab.Screen name="Feed">
          {(props) => <FeedTab {...props} navigation={navigation} />}
        </Tab.Screen>
        <Tab.Screen name="Reels">
          {(props) => <ReelsTab {...props} navigation={navigation} />}
        </Tab.Screen>
      </Tab.Navigator>
    </SafeAreaView>
  );
}

/**
 * Feed Tab - Instagram-style posts with Stories at top
 */
function FeedTab({ navigation }) {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  /**
   * Load initial data
   */
  useEffect(() => {
    loadStories();
    loadPosts();
  }, []);

  /**
   * Load stories (24-hour content)
   */
  const loadStories = async () => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('gallery')
        .select(`
          *,
          uploader:members!gallery_member_id_fkey(id, full_name, photo_url)
        `)
        .eq('item_type', 'story')
        .eq('is_approved', true)
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Group stories by uploader
        const groupedStories = {};
        data.forEach(story => {
          const uploaderId = story.uploader.id;
          if (!groupedStories[uploaderId]) {
            groupedStories[uploaderId] = {
              uploader: story.uploader,
              stories: [],
              hasUnseen: true, // TODO: Track viewed stories
            };
          }
          groupedStories[uploaderId].stories.push(story);
        });

        setStories(Object.values(groupedStories));
      }
    } catch (error) {
      console.error('Error loading stories:', error);
    }
  };

  /**
   * Load feed posts
   */
  const loadPosts = async (pageNum = 0) => {
    try {
      const from = pageNum * 20;
      const to = from + 19;

      const { data, error } = await supabase
        .from('gallery')
        .select(`
          *,
          uploader:members!gallery_member_id_fkey(id, full_name, photo_url),
          likes:gallery_likes(count),
          comments:gallery_comments(count)
        `)
        .eq('item_type', 'post')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (!error && data) {
        // Check if user has liked each post
        const postsWithLikeStatus = await Promise.all(
          data.map(async (post) => {
            const { data: likeData } = await supabase
              .from('gallery_likes')
              .select('id')
              .eq('gallery_item_id', post.id)
              .eq('member_id', profile?.id)
              .single();

            return {
              ...post,
              isLiked: !!likeData,
            };
          })
        );

        if (pageNum === 0) {
          setPosts(postsWithLikeStatus);
        } else {
          setPosts(prev => [...prev, ...postsWithLikeStatus]);
        }
        setHasMore(data.length === 20);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Refresh feed
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0);
    loadStories();
    loadPosts(0);
  }, []);

  /**
   * Load more posts
   */
  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage);
    }
  };

  /**
   * Render stories row
   */
  const renderStories = () => (
    <View style={styles.storiesContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[{ id: 'add', isAdd: true }, ...stories]}
        keyExtractor={(item) => item.id || 'add'}
        renderItem={({ item }) => {
          if (item.isAdd) {
            return (
              <TouchableOpacity
                style={styles.addStoryButton}
                onPress={() => navigation.navigate('CreateStory')}
              >
                <View style={styles.addStoryCircle}>
                  <Icon name="add" size={32} color={colors.primary} />
                </View>
                <Text style={styles.storyUsername}>Your Story</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              style={styles.storyItem}
              onPress={() =>
                navigation.navigate('StoryViewer', {
                  stories: item.stories,
                  initialIndex: 0,
                })
              }
            >
              <View
                style={[
                  styles.storyCircle,
                  item.hasUnseen && styles.storyCircleUnseen,
                ]}
              >
                <Avatar
                  uri={item.uploader.photo_url}
                  name={item.uploader.full_name}
                  size={64}
                />
              </View>
              <Text style={styles.storyUsername} numberOfLines={1}>
                {item.uploader.full_name?.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.storiesContent}
      />
    </View>
  );

  /**
   * Render post item
   */
  const renderPost = ({ item }) => (
    <PostCard
      post={item}
      onLike={() => handleLike(item.id)}
      onComment={() => navigation.navigate('Comments', { postId: item.id })}
      onShare={() => handleShare(item)}
      navigation={navigation}
      colors={colors}
    />
  );

  /**
   * Handle like
   */
  const handleLike = async (postId) => {
    const post = posts.find(p => p.id === postId);
    const isCurrentlyLiked = post?.isLiked;

    // Optimistic update
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? {
              ...p,
              isLiked: !isCurrentlyLiked,
              likes: [{ count: (p.likes[0]?.count || 0) + (isCurrentlyLiked ? -1 : 1) }],
            }
          : p
      )
    );

    try {
      if (isCurrentlyLiked) {
        // Unlike: Delete from gallery_likes
        const { error } = await supabase
          .from('gallery_likes')
          .delete()
          .eq('gallery_item_id', postId)
          .eq('member_id', profile?.id);

        if (error) throw error;
      } else {
        // Like: Insert into gallery_likes
        const { error } = await supabase
          .from('gallery_likes')
          .insert({
            gallery_item_id: postId,
            member_id: profile?.id,
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? {
                ...p,
                isLiked: isCurrentlyLiked,
                likes: [{ count: (p.likes[0]?.count || 0) + (isCurrentlyLiked ? 1 : -1) }],
              }
            : p
        )
      );
    }
  };

  /**
   * Handle share
   */
  const handleShare = async (post) => {
    try {
      const { Share } = require('react-native');

      await Share.share({
        message: post.caption
          ? `${post.uploader.full_name}: ${post.caption}\n\nView on Mahaveer Seva`
          : `Check out this post from ${post.uploader.full_name} on Mahaveer Seva`,
        url: post.media_url,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={renderPost}
      ListHeaderComponent={renderStories}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        hasMore ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null
      }
    />
  );
}

/**
 * Reels Tab - TikTok-style vertical videos
 */
function ReelsTab({ navigation }) {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  /**
   * Load reels
   */
  useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select(`
          *,
          uploader:members!gallery_member_id_fkey(id, full_name, photo_url),
          likes:gallery_likes(count),
          comments:gallery_comments(count)
        `)
        .eq('item_type', 'reel')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        // Check if user has liked each reel
        const reelsWithLikeStatus = await Promise.all(
          data.map(async (reel) => {
            const { data: likeData } = await supabase
              .from('gallery_likes')
              .select('id')
              .eq('gallery_item_id', reel.id)
              .eq('member_id', profile?.id)
              .single();

            return {
              ...reel,
              isLiked: !!likeData,
            };
          })
        );

        setReels(reelsWithLikeStatus);
      }
    } catch (error) {
      console.error('Error loading reels:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle like for reels
   */
  const handleReelLike = async (reelId) => {
    const reel = reels.find(r => r.id === reelId);
    const isCurrentlyLiked = reel?.isLiked;

    // Optimistic update
    setReels(prev =>
      prev.map(r =>
        r.id === reelId
          ? {
              ...r,
              isLiked: !isCurrentlyLiked,
              likes: [{ count: (r.likes[0]?.count || 0) + (isCurrentlyLiked ? -1 : 1) }],
            }
          : r
      )
    );

    try {
      if (isCurrentlyLiked) {
        const { error } = await supabase
          .from('gallery_likes')
          .delete()
          .eq('gallery_item_id', reelId)
          .eq('member_id', profile?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('gallery_likes')
          .insert({
            gallery_item_id: reelId,
            member_id: profile?.id,
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling reel like:', error);
      setReels(prev =>
        prev.map(r =>
          r.id === reelId
            ? {
                ...r,
                isLiked: isCurrentlyLiked,
                likes: [{ count: (r.likes[0]?.count || 0) + (isCurrentlyLiked ? 1 : -1) }],
              }
            : r
        )
      );
    }
  };

  /**
   * Handle share for reels
   */
  const handleReelShare = async (reel) => {
    try {
      const { Share } = require('react-native');

      await Share.share({
        message: reel.caption
          ? `${reel.uploader.full_name}: ${reel.caption}\n\nWatch on Mahaveer Seva`
          : `Check out this reel from ${reel.uploader.full_name} on Mahaveer Seva`,
        url: reel.media_url,
      });
    } catch (error) {
      console.error('Error sharing reel:', error);
    }
  };

  /**
   * Render reel item
   */
  const renderReel = ({ item, index }) => (
    <ReelCard
      reel={item}
      isActive={index === currentIndex}
      onLike={() => handleReelLike(item.id)}
      onComment={() => navigation.navigate('Comments', { postId: item.id })}
      onShare={() => handleReelShare(item)}
      colors={colors}
    />
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (reels.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Icon name="film-outline" size={64} color={colors.textTertiary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No reels yet</Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('CreateReel')}
        >
          <Text style={[styles.createButtonText, { color: '#FFFFFF' }]}>Create First Reel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={reels}
      keyExtractor={(item) => item.id}
      renderItem={renderReel}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={Dimensions.get('window').height}
      snapToAlignment="start"
      decelerationRate="fast"
      onViewableItemsChanged={({ viewableItems }) => {
        if (viewableItems[0]) {
          setCurrentIndex(viewableItems[0].index);
        }
      }}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 50,
      }}
    />
  );
}

/**
 * Post Card Component
 */
function PostCard({ post, onLike, onComment, onShare, navigation, colors }) {
  return (
    <View style={[styles.postCard, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.postHeader}>
        <TouchableOpacity
          style={styles.postHeaderLeft}
          onPress={() =>
            navigation.navigate('MemberProfile', { memberId: post.uploader.id })
          }
        >
          <Avatar
            uri={post.uploader.photo_url}
            name={post.uploader.full_name}
            size={40}
          />
          <View style={styles.postHeaderText}>
            <Text style={[styles.postUsername, { color: colors.textPrimary }]}>{post.uploader.full_name}</Text>
            <Text style={[styles.postTime, { color: colors.textTertiary }]}>{formatTimeAgo(post.created_at)}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="ellipsis-vertical" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Media */}
      {post.media_url && (
        <Image
          source={{ uri: post.media_url }}
          style={[styles.postImage, { backgroundColor: colors.surface }]}
          resizeMode="cover"
        />
      )}

      {/* Actions */}
      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onLike}
          >
            <Icon
              name={post.isLiked ? 'heart' : 'heart-outline'}
              size={28}
              color={post.isLiked ? '#F43F5E' : colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onComment}>
            <Icon name="chatbubble-outline" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onShare}>
            <Icon name="paper-plane-outline" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Icon name="bookmark-outline" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Likes */}
      {post.likes?.[0]?.count > 0 && (
        <Text style={[styles.likesText, { color: colors.textPrimary }]}>
          {post.likes[0].count} {post.likes[0].count === 1 ? 'like' : 'likes'}
        </Text>
      )}

      {/* Caption */}
      {post.caption && (
        <View style={styles.captionContainer}>
          <Text style={[styles.captionText, { color: colors.textPrimary }]}>
            <Text style={styles.captionUsername}>{post.uploader.full_name} </Text>
            {post.caption}
          </Text>
        </View>
      )}

      {/* Comments */}
      {post.comments?.[0]?.count > 0 && (
        <TouchableOpacity onPress={onComment}>
          <Text style={[styles.viewCommentsText, { color: colors.textTertiary }]}>
            View all {post.comments[0].count} comments
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * Reel Card Component
 */
function ReelCard({ reel, isActive, onLike, onComment, onShare, colors }) {
  return (
    <View style={[styles.reelCard, { backgroundColor: colors.background }]}>
      {/* Video placeholder */}
      <Image
        source={{ uri: reel.media_url }}
        style={styles.reelVideo}
        resizeMode="cover"
      />

      {/* Overlay */}
      <View style={styles.reelOverlay}>
        {/* Left side - info */}
        <View style={styles.reelInfo}>
          <View style={styles.reelUserInfo}>
            <Avatar uri={reel.uploader.photo_url} name={reel.uploader.full_name} size={40} />
            <Text style={[styles.reelUsername, { color: colors.textPrimary }]}>{reel.uploader.full_name}</Text>
          </View>
          {reel.caption && <Text style={[styles.reelCaption, { color: colors.textPrimary }]}>{reel.caption}</Text>}
        </View>

        {/* Right side - actions */}
        <View style={styles.reelActions}>
          <TouchableOpacity style={styles.reelActionButton} onPress={onLike}>
            <Icon
              name={reel.isLiked ? 'heart' : 'heart-outline'}
              size={32}
              color={reel.isLiked ? '#F43F5E' : '#FFFFFF'}
            />
            <Text style={[styles.reelActionText, { color: '#FFFFFF' }]}>
              {reel.likes?.[0]?.count || 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reelActionButton} onPress={onComment}>
            <Icon name="chatbubble-outline" size={32} color="#FFFFFF" />
            <Text style={[styles.reelActionText, { color: '#FFFFFF' }]}>
              {reel.comments?.[0]?.count || 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reelActionButton} onPress={onShare}>
            <Icon name="paper-plane-outline" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return formatDate(timestamp);
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
  uploadButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Stories
  storiesContainer: {
    backgroundColor: colors.background,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  storiesContent: {
    paddingHorizontal: 12,
  },
  addStoryButton: {
    alignItems: 'center',
    marginRight: 12,
  },
  addStoryCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 12,
  },
  storyCircle: {
    padding: 3,
    borderRadius: 38,
    backgroundColor: colors.background,
    marginBottom: 4,
  },
  storyCircleUnseen: {
    padding: 3,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  storyUsername: {
    fontSize: 12,
    color: colors.textSecondary,
    maxWidth: 72,
  },
  // Posts
  postCard: {
    backgroundColor: colors.background,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  postHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postHeaderText: {
    marginLeft: 10,
    flex: 1,
  },
  postUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  postTime: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  postImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    backgroundColor: colors.backgroundSecondary,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  postActionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 16,
  },
  likesText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  captionContainer: {
    paddingHorizontal: 12,
    marginTop: 4,
  },
  captionText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  captionUsername: {
    fontWeight: '600',
  },
  viewCommentsText: {
    fontSize: 14,
    color: colors.textTertiary,
    paddingHorizontal: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  // Reels
  reelCard: {
    height: Dimensions.get('window').height,
    backgroundColor: colors.background,
  },
  reelVideo: {
    width: '100%',
    height: '100%',
  },
  reelOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 32,
  },
  reelInfo: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  reelUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reelUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 10,
  },
  reelCaption: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  reelActions: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  reelActionButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  reelActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 4,
  },
  footerLoader: {
    padding: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
