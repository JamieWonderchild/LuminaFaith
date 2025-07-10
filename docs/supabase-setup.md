# Supabase Setup Guide for LuminaFaith

## 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com) and sign up/login
2. Click "New project"
3. Choose your organization
4. Enter project details:
   - Name: `LuminaFaith`
   - Database Password: Choose a strong password
   - Region: Choose closest to your users
5. Click "Create new project"

## 2. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. In your Supabase dashboard, go to Settings > API
3. Copy the values:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## 3. Run Database Migration

Execute the following SQL in your Supabase SQL Editor:

### Create Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  streak INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  daily_goal INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Religions table
CREATE TABLE religions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  total_paths INTEGER DEFAULT 0,
  estimated_duration TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning paths table
CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  religion_id UUID REFERENCES religions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
  total_lessons INTEGER DEFAULT 0,
  estimated_time INTEGER,
  prerequisites TEXT[],
  order_index INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT CHECK (type IN ('reading', 'quiz', 'matching', 'audio', 'video', 'interactive', 'reflection', 'practice')) NOT NULL,
  content JSONB NOT NULL,
  duration INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 10,
  prerequisites TEXT[],
  order_index INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress table
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  completed_lessons INTEGER DEFAULT 0,
  current_lesson_id UUID REFERENCES lessons(id),
  xp_earned INTEGER DEFAULT 0,
  accuracy DECIMAL(5,2) DEFAULT 0.0,
  streak INTEGER DEFAULT 0,
  last_studied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, path_id)
);

-- Lesson completions table
CREATE TABLE lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accuracy DECIMAL(5,2),
  xp_earned INTEGER NOT NULL,
  time_spent INTEGER,
  answers JSONB,
  UNIQUE(user_id, lesson_id)
);

-- Achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT CHECK (category IN ('streak', 'completion', 'accuracy', 'participation', 'milestone')) NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

### Create Indexes

```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_last_active ON users(last_active_at);
CREATE INDEX idx_learning_paths_religion ON learning_paths(religion_id);
CREATE INDEX idx_learning_paths_level ON learning_paths(level);
CREATE INDEX idx_learning_paths_published ON learning_paths(is_published);
CREATE INDEX idx_lessons_path ON lessons(path_id);
CREATE INDEX idx_lessons_type ON lessons(type);
CREATE INDEX idx_lessons_published ON lessons(is_published);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_lesson_completions_user ON lesson_completions(user_id);
CREATE INDEX idx_lesson_completions_lesson ON lesson_completions(lesson_id);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_achievements_category ON achievements(category);
```

### Create Functions

```sql
-- Function to increment user XP
CREATE OR REPLACE FUNCTION increment_user_xp(user_id UUID, xp_amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET 
    total_xp = total_xp + xp_amount,
    current_level = CASE 
      WHEN (total_xp + xp_amount) >= 1000 THEN FLOOR((total_xp + xp_amount) / 1000) + 1
      ELSE current_level
    END,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update path total lessons when lesson is added
CREATE OR REPLACE FUNCTION update_path_lesson_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE learning_paths 
    SET total_lessons = total_lessons + 1 
    WHERE id = NEW.path_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE learning_paths 
    SET total_lessons = total_lessons - 1 
    WHERE id = OLD.path_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update lesson counts
CREATE TRIGGER update_path_lesson_count_trigger
  AFTER INSERT OR DELETE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_path_lesson_count();

-- Function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Spiritual Seeker')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### Setup Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE religions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Public read access for content
CREATE POLICY "Anyone can view active religions" ON religions FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Anyone can view published paths" ON learning_paths FOR SELECT TO authenticated USING (is_published = true);
CREATE POLICY "Anyone can view published lessons" ON lessons FOR SELECT TO authenticated USING (is_published = true);
CREATE POLICY "Anyone can view active achievements" ON achievements FOR SELECT TO authenticated USING (is_active = true);

-- User-specific data protection
CREATE POLICY "Users can view own progress" ON user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own completions" ON lesson_completions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own achievements" ON user_achievements FOR ALL USING (auth.uid() = user_id);
```

## 4. Insert Sample Data

```sql
-- Insert sample religions
INSERT INTO religions (name, display_name, icon, color, description) VALUES
('christianity', 'Christianity', '✝️', '#4A90E2', 'Learn about Christian faith, teachings of Jesus, and spiritual practices.'),
('islam', 'Islam', '☪️', '#27AE60', 'Explore Islamic teachings, the Quran, and the path of submission to Allah.'),
('judaism', 'Judaism', '✡️', '#8E44AD', 'Discover Jewish traditions, Torah wisdom, and spiritual heritage.'),
('buddhism', 'Buddhism', '☸️', '#F39C12', 'Follow the path of enlightenment through Buddhist teachings and meditation.'),
('hinduism', 'Hinduism', '🕉️', '#E74C3C', 'Explore ancient Vedic wisdom, yoga, and spiritual philosophies.');

-- Insert sample learning path
INSERT INTO learning_paths (religion_id, title, description, level, order_index, is_published) 
SELECT id, 'Introduction to Faith', 'Begin your spiritual journey with foundational teachings.', 'beginner', 1, true
FROM religions WHERE name = 'christianity';

-- Insert sample lesson
INSERT INTO lessons (path_id, title, description, type, content, duration, order_index, is_published)
SELECT id, 'What is Faith?', 'Understanding the essence of spiritual belief.', 'reading', 
'{"text": "Faith is the foundation of spiritual life...", "questions": [{"id": "q1", "type": "multiple-choice", "question": "What is faith?", "options": ["Belief", "Trust", "Both", "Neither"], "correct_answer": "Both"}]}', 
10, 1, true
FROM learning_paths WHERE title = 'Introduction to Faith';
```

## 5. Test Connection

Run this in your app to test the connection:

```typescript
import { checkSupabaseConnection } from '@/config/supabase';

const testConnection = async () => {
  const isConnected = await checkSupabaseConnection();
  console.log('Supabase connected:', isConnected);
};
```

## 6. Optional: Enable Real-time

In your Supabase dashboard:
1. Go to Database > Replication
2. Enable replication for tables you want real-time updates:
   - `user_progress`
   - `lesson_completions`
   - `user_achievements`

## 7. Storage Setup (for media files)

1. Go to Storage in Supabase dashboard
2. Create buckets:
   - `lessons-media` (for lesson images, audio, video)
   - `user-avatars` (for profile pictures)
3. Set up policies for each bucket as needed

## Next Steps

- Set up authentication flows in your app
- Implement data fetching with the services
- Add offline synchronization
- Set up push notifications
- Create content management interface

Your backend is now ready! 🚀