import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

interface Discussion {
  id: string;
  title: string;
  author: string;
  content: string;
  category: string;
  replies: number;
  likes: number;
  timeAgo: string;
  tags: string[];
}

const mockDiscussions: Discussion[] = [
  {
    id: '1',
    title: 'How do you maintain mindfulness throughout the day?',
    author: 'MindfulSeeker',
    content: 'I\'ve been practicing meditation for a few months now, but I struggle to maintain mindfulness when I\'m busy at work. Any tips?',
    category: 'Buddhism',
    replies: 12,
    likes: 25,
    timeAgo: '2 hours ago',
    tags: ['mindfulness', 'meditation', 'daily-practice']
  },
  {
    id: '2',
    title: 'Understanding the Parable of the Good Samaritan',
    author: 'SeekingWisdom',
    content: 'I\'d love to discuss different interpretations of this parable and how it applies to modern life.',
    category: 'Christianity',
    replies: 8,
    likes: 18,
    timeAgo: '4 hours ago',
    tags: ['parables', 'compassion', 'interpretation']
  },
  {
    id: '3',
    title: 'Interfaith dialogue: Common values across religions',
    author: 'BridgeBuilder',
    content: 'What are some core values that you see shared across different religious traditions?',
    category: 'Interfaith',
    replies: 23,
    likes: 45,
    timeAgo: '1 day ago',
    tags: ['interfaith', 'values', 'dialogue']
  },
  {
    id: '4',
    title: 'Preparing for Ramadan: Tips for first-time observers',
    author: 'NewMuslim',
    content: 'This will be my first Ramadan. Looking for practical advice on preparation and what to expect.',
    category: 'Islam',
    replies: 15,
    likes: 32,
    timeAgo: '2 days ago',
    tags: ['ramadan', 'fasting', 'preparation']
  }
];

export default function CommunityScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Buddhism', 'Christianity', 'Islam', 'Hinduism', 'Judaism', 'Interfaith'];

  const filteredDiscussions = mockDiscussions.filter(discussion => {
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || discussion.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Buddhism': return '🧘';
      case 'Christianity': return '✝️';
      case 'Islam': return '☪️';
      case 'Hinduism': return '🕉️';
      case 'Judaism': return '✡️';
      case 'Interfaith': return '🌍';
      default: return '💭';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Community</Text>
          <Text style={styles.subtitle}>Connect, discuss, and learn together</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search discussions..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#64748B"
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  (selectedCategory === category || (!selectedCategory && category === 'All')) && 
                  styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category === 'All' ? null : category)}
              >
                {category !== 'All' && (
                  <Text style={styles.categoryIcon}>{getCategoryIcon(category)}</Text>
                )}
                <Text style={[
                  styles.categoryButtonText,
                  (selectedCategory === category || (!selectedCategory && category === 'All')) && 
                  styles.categoryButtonTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Community Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>2.3k</Text>
            <Text style={styles.statLabel}>Members</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Discussions</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Active Today</Text>
          </Card>
        </View>

        {/* New Discussion Button */}
        <View style={styles.newDiscussionContainer}>
          <Button
            title="Start New Discussion"
            onPress={() => {/* Handle new discussion */}}
            icon="✍️"
            fullWidth
          />
        </View>

        {/* Discussions */}
        <View style={styles.discussionsContainer}>
          <Text style={styles.sectionTitle}>Recent Discussions</Text>
          
          {filteredDiscussions.map((discussion) => (
            <Card key={discussion.id} style={styles.discussionCard} onPress={() => {/* Navigate to discussion */}}>
              <View style={styles.discussionHeader}>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryTagIcon}>{getCategoryIcon(discussion.category)}</Text>
                  <Text style={styles.categoryTagText}>{discussion.category}</Text>
                </View>
                <Text style={styles.timeAgo}>{discussion.timeAgo}</Text>
              </View>

              <Text style={styles.discussionTitle}>{discussion.title}</Text>
              <Text style={styles.discussionContent} numberOfLines={2}>
                {discussion.content}
              </Text>

              <View style={styles.tagsContainer}>
                {discussion.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.discussionFooter}>
                <View style={styles.authorContainer}>
                  <View style={styles.authorAvatar}>
                    <Text style={styles.authorAvatarText}>
                      {discussion.author.charAt(0)}
                    </Text>
                  </View>
                  <Text style={styles.authorName}>{discussion.author}</Text>
                </View>

                <View style={styles.engagementContainer}>
                  <View style={styles.engagementItem}>
                    <Text style={styles.engagementIcon}>💬</Text>
                    <Text style={styles.engagementText}>{discussion.replies}</Text>
                  </View>
                  <View style={styles.engagementItem}>
                    <Text style={styles.engagementIcon}>❤️</Text>
                    <Text style={styles.engagementText}>{discussion.likes}</Text>
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Empty State */}
        {filteredDiscussions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💭</Text>
            <Text style={styles.emptyTitle}>No discussions found</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery 
                ? 'Try adjusting your search terms or browse different categories.'
                : 'Be the first to start a discussion in this category!'
              }
            </Text>
            {!searchQuery && (
              <Button
                title="Start Discussion"
                onPress={() => {/* Handle new discussion */}}
                style={styles.emptyActionButton}
              />
            )}
          </View>
        )}

        {/* Community Guidelines */}
        <Card style={styles.guidelinesCard}>
          <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
          <View style={styles.guidelineItem}>
            <Text style={styles.guidelineIcon}>🤝</Text>
            <Text style={styles.guidelineText}>Be respectful and kind to all members</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Text style={styles.guidelineIcon}>🌍</Text>
            <Text style={styles.guidelineText}>Welcome diverse perspectives and backgrounds</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Text style={styles.guidelineIcon}>💭</Text>
            <Text style={styles.guidelineText}>Stay on topic and contribute meaningfully</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Text style={styles.guidelineIcon}>🙏</Text>
            <Text style={styles.guidelineText}>Approach all faiths with curiosity and respect</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#CBD5E1',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#F8FAFC',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  statLabel: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 4,
  },
  newDiscussionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  discussionsContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  discussionCard: {
    marginBottom: 16,
  },
  discussionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryTagIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  timeAgo: {
    fontSize: 12,
    color: '#64748B',
  },
  discussionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
    lineHeight: 22,
  },
  discussionContent: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#312E81',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: '600',
  },
  discussionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  authorAvatarText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  authorName: {
    fontSize: 12,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  engagementContainer: {
    flexDirection: 'row',
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  engagementIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  engagementText: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyActionButton: {
    marginTop: 16,
  },
  guidelinesCard: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guidelineIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  guidelineText: {
    fontSize: 14,
    color: '#CBD5E1',
    flex: 1,
  },
});