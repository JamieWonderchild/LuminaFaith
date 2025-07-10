# LuminaFaith Database Schema

## Overview
This document outlines the database schema for LuminaFaith, designed for Supabase PostgreSQL with real-time capabilities and spiritual learning workflows.

## Core Tables

### 1. Users (`users`)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  streak INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  daily_goal INTEGER DEFAULT 15, -- minutes per day
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Religions (`religions`)
```sql
CREATE TABLE religions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  total_paths INTEGER DEFAULT 0,
  estimated_duration TEXT, -- "2-3 months"
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Learning Paths (`learning_paths`)
```sql
CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  religion_id UUID REFERENCES religions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
  total_lessons INTEGER DEFAULT 0,
  estimated_time INTEGER, -- minutes
  prerequisites TEXT[], -- array of path IDs
  order_index INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Lessons (`lessons`)
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT CHECK (type IN ('reading', 'quiz', 'matching', 'audio', 'video', 'interactive', 'reflection', 'practice')) NOT NULL,
  content JSONB NOT NULL, -- flexible content structure
  duration INTEGER NOT NULL, -- minutes
  xp_reward INTEGER DEFAULT 10,
  prerequisites TEXT[], -- array of lesson IDs
  order_index INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. User Religion Preferences (`user_religions`)
```sql
CREATE TABLE user_religions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  religion_id UUID REFERENCES religions(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, religion_id)
);
```

### 6. User Progress (`user_progress`)
```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  completed_lessons INTEGER DEFAULT 0,
  current_lesson_id UUID REFERENCES lessons(id),
  xp_earned INTEGER DEFAULT 0,
  accuracy DECIMAL(5,2) DEFAULT 0.0, -- percentage
  streak INTEGER DEFAULT 0,
  last_studied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, path_id)
);
```

### 7. Lesson Completions (`lesson_completions`)
```sql
CREATE TABLE lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accuracy DECIMAL(5,2), -- percentage for quizzes
  xp_earned INTEGER NOT NULL,
  time_spent INTEGER, -- minutes
  answers JSONB, -- store quiz answers for analytics
  UNIQUE(user_id, lesson_id)
);
```

### 8. Achievements (`achievements`)
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT CHECK (category IN ('streak', 'completion', 'accuracy', 'participation', 'milestone')) NOT NULL,
  requirement_type TEXT NOT NULL, -- 'streak_days', 'lessons_completed', 'accuracy_avg', etc.
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 9. User Achievements (`user_achievements`)
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

### 10. Study Sessions (`study_sessions`)
```sql
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- seconds
  accuracy DECIMAL(5,2), -- percentage
  xp_earned INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  session_data JSONB -- store detailed session analytics
);
```

### 11. Daily Challenges (`daily_challenges`)
```sql
CREATE TABLE daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('quiz', 'reading', 'reflection', 'practice')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content JSONB NOT NULL,
  xp_reward INTEGER DEFAULT 20,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 12. User Daily Challenges (`user_daily_challenges`)
```sql
CREATE TABLE user_daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answers JSONB,
  xp_earned INTEGER NOT NULL,
  UNIQUE(user_id, challenge_id)
);
```

## Indexes for Performance

```sql
-- User lookup indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_last_active ON users(last_active_at);

-- Learning path indexes
CREATE INDEX idx_learning_paths_religion ON learning_paths(religion_id);
CREATE INDEX idx_learning_paths_level ON learning_paths(level);
CREATE INDEX idx_learning_paths_published ON learning_paths(is_published);

-- Lesson indexes
CREATE INDEX idx_lessons_path ON lessons(path_id);
CREATE INDEX idx_lessons_type ON lessons(type);
CREATE INDEX idx_lessons_published ON lessons(is_published);

-- Progress tracking indexes
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_lesson_completions_user ON lesson_completions(user_id);
CREATE INDEX idx_lesson_completions_lesson ON lesson_completions(lesson_id);
CREATE INDEX idx_study_sessions_user ON study_sessions(user_id);

-- Achievement indexes
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_achievements_category ON achievements(category);
```

## Row Level Security (RLS) Policies

```sql
-- Users can only see/edit their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Public read access for religions and published content
ALTER TABLE religions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view religions" ON religions FOR SELECT TO authenticated USING (is_active = true);

ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published paths" ON learning_paths FOR SELECT TO authenticated USING (is_published = true);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published lessons" ON lessons FOR SELECT TO authenticated USING (is_published = true);

-- User-specific data protection
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON user_progress FOR ALL USING (auth.uid() = user_id);

ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own completions" ON lesson_completions FOR ALL USING (auth.uid() = user_id);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON study_sessions FOR ALL USING (auth.uid() = user_id);
```

## Real-time Subscriptions

Key tables for real-time updates:
- `user_progress` - Live progress tracking
- `lesson_completions` - Achievement notifications
- `user_achievements` - Badge unlocks
- `study_sessions` - Live session tracking

## Content Structure Examples

### Lesson Content JSON Structure
```json
{
  "text": "Introduction to meditation practices...",
  "audio": "https://storage.url/audio.mp3",
  "video": "https://storage.url/video.mp4",
  "images": ["https://storage.url/image1.jpg"],
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "What is the primary goal of meditation?",
      "options": ["Relaxation", "Spiritual growth", "Both", "Neither"],
      "correct_answer": "Both",
      "explanation": "Meditation serves both relaxation and spiritual growth...",
      "difficulty": "easy"
    }
  ],
  "activities": [
    {
      "id": "a1",
      "type": "meditation",
      "title": "5-Minute Breathing Exercise",
      "instructions": "Find a quiet space and focus on your breath...",
      "duration": 5
    }
  ],
  "references": [
    {
      "title": "The Art of Meditation",
      "author": "Various Masters",
      "source": "Ancient Texts",
      "type": "traditional"
    }
  ]
}
```

## Migration Strategy

1. **Phase 1**: Core tables (users, religions, paths, lessons)
2. **Phase 2**: Progress tracking (user_progress, completions, sessions)
3. **Phase 3**: Gamification (achievements, challenges)
4. **Phase 4**: Advanced features (communities, discussions)

This schema supports:
- Multi-religion content management
- Flexible lesson types and content
- Comprehensive progress tracking
- Gamification and achievements
- Real-time features
- Scalable architecture for growth