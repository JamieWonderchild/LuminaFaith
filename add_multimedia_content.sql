-- LuminaFaith: Multimedia Content (Audio, Video, Meditation)
-- Execute this in your Supabase SQL Editor to add rich multimedia lessons

-- 1. Add audio content (guided meditations, prayers, chants)
INSERT INTO lessons (path_id, title, description, type, content, duration, order_index, is_published) VALUES

-- Buddhism - Meditation Audio Content
((SELECT id FROM learning_paths WHERE title = 'Mindfulness & Meditation'), 
'Guided Loving-Kindness Meditation', 
'A 15-minute guided meditation to cultivate compassion for yourself and others.', 
'audio', 
'{"audio_url": "https://example.com/loving-kindness-meditation.mp3", "transcript": "Begin by finding a comfortable seated position. Close your eyes and take three deep breaths. Now, bring to mind someone you love unconditionally...", "instructions": "Find a quiet space where you will not be disturbed. Sit comfortably with your back straight. You can close your eyes or soften your gaze.", "meditation_steps": ["Find comfortable position", "Focus on your breath", "Bring loved one to mind", "Extend loving-kindness to yourself", "Extend to neutral person", "Extend to difficult person", "Extend to all beings"], "benefits": ["Increases compassion", "Reduces stress", "Improves emotional regulation", "Enhances empathy"]}', 
15, 2, true),

((SELECT id FROM learning_paths WHERE title = 'Mindfulness & Meditation'), 
'Body Scan Meditation', 
'A relaxing 20-minute body scan to release tension and cultivate awareness.', 
'audio', 
'{"audio_url": "https://example.com/body-scan-meditation.mp3", "transcript": "We will begin by lying down comfortably. Close your eyes and take a few deep breaths. Now, bring your attention to the top of your head...", "instructions": "Lie down on your back with your arms at your sides. Close your eyes and relax your entire body.", "meditation_steps": ["Lie down comfortably", "Start with deep breathing", "Focus on top of head", "Move attention through body", "Notice sensations without judgment", "End with full body awareness"], "benefits": ["Reduces physical tension", "Increases body awareness", "Promotes relaxation", "Improves sleep quality"]}', 
20, 3, true),

-- Christianity - Prayer Audio Content
((SELECT id FROM learning_paths WHERE title = 'Introduction to Christianity'), 
'The Rosary Prayer', 
'Learn and pray the traditional Catholic Rosary with guided audio.', 
'audio', 
'{"audio_url": "https://example.com/rosary-prayer.mp3", "transcript": "In the name of the Father, and of the Son, and of the Holy Spirit. Amen. I believe in God, the Father Almighty...", "instructions": "Hold a rosary in your hands. Begin with the Sign of the Cross and follow along with the guided prayers.", "prayer_structure": ["Sign of the Cross", "Apostles Creed", "Our Father", "3 Hail Marys", "Glory Be", "5 Decades of the Rosary", "Hail Holy Queen"], "benefits": ["Deepens prayer life", "Brings peace", "Connects with tradition", "Focuses the mind on Christ"]}', 
25, 6, true),

-- Islam - Quranic Recitation
((SELECT id FROM learning_paths WHERE title = 'The Five Pillars'), 
'Surah Al-Fatiha Recitation', 
'Learn the opening chapter of the Quran with proper pronunciation and meaning.', 
'audio', 
'{"audio_url": "https://example.com/surah-al-fatiha.mp3", "transcript": "Bismillah ir-Rahman ir-Raheem. Al-hamdu lillahi rabbil alameen...", "instructions": "Listen to the recitation and follow along with the Arabic text and English translation.", "arabic_text": "بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ الْحَمْدُ لِلَّـهِ رَبِّ الْعَالَمِينَ", "translation": "In the name of Allah, the Most Gracious, the Most Merciful. Praise be to Allah, Lord of the worlds.", "benefits": ["Improves Arabic pronunciation", "Deepens understanding", "Connects with Quran", "Enhances prayer"]}', 
10, 4, true),

-- Judaism - Traditional Chanting
((SELECT id FROM learning_paths WHERE title = 'Jewish Holidays and Festivals'), 
'Shabbat Blessings', 
'Learn the traditional blessings for welcoming the Sabbath.', 
'audio', 
'{"audio_url": "https://example.com/shabbat-blessings.mp3", "transcript": "Baruch atah Adonai, Eloheinu melech ha-olam, asher kid-shanu b-mitzvotav v-tzivanu l-hadlik ner shel Shabbat...", "instructions": "Light the Shabbat candles and recite the blessings to welcome the Sabbath.", "hebrew_text": "בָּרוּךְ אַתָּה יי אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם", "translation": "Blessed are You, Lord our God, King of the universe, who has sanctified us with His commandments and commanded us to kindle the Sabbath light.", "benefits": ["Connects with tradition", "Brings peace to home", "Marks sacred time", "Builds Jewish identity"]}', 
8, 2, true);

-- 2. Add video content (ritual demonstrations, teachings)
INSERT INTO lessons (path_id, title, description, type, content, duration, order_index, is_published) VALUES

-- Hinduism - Ritual Videos
((SELECT id FROM learning_paths WHERE title = 'Hindu Deities and Stories'), 
'Hindu Puja Ceremony', 
'Watch and learn how to perform a traditional Hindu worship ceremony.', 
'video', 
'{"video_url": "https://example.com/hindu-puja-ceremony.mp4", "thumbnail": "https://example.com/puja-thumbnail.jpg", "transcript": "Welcome to this demonstration of a traditional Hindu puja ceremony. We begin by purifying the space and ourselves...", "materials_needed": ["Small altar or clean space", "Incense", "Flowers", "Small lamp or candle", "Water in small bowl", "Rice grains"], "steps": ["Purify the space", "Light incense and lamp", "Offer flowers", "Chant mantras", "Offer food (prasad)", "Conclude with aarti"], "cultural_significance": "Puja connects devotees with the divine and brings blessings to the home."}', 
18, 2, true),

-- Buddhism - Meditation Techniques
((SELECT id FROM learning_paths WHERE title = 'Buddhist Philosophy'), 
'Walking Meditation Practice', 
'Learn the art of mindful walking meditation with step-by-step guidance.', 
'video', 
'{"video_url": "https://example.com/walking-meditation.mp4", "thumbnail": "https://example.com/walking-thumbnail.jpg", "transcript": "Walking meditation is a form of meditation in action. We will learn to walk slowly and mindfully...", "location_tips": ["Choose a quiet path 10-20 steps long", "Can be done indoors or outdoors", "Flat surface preferred", "Minimal distractions"], "technique": ["Stand at one end of your path", "Walk very slowly", "Focus on the sensations of walking", "Turn mindfully at each end", "Coordinate with breathing"], "benefits": ["Combines movement with meditation", "Good for restless minds", "Builds concentration", "Can be done anywhere"]}', 
15, 2, true),

-- Christianity - Ritual Demonstration
((SELECT id FROM learning_paths WHERE title = 'Christian Ethics and Morality'), 
'Christian Baptism Meaning', 
'Understand the significance and symbolism of Christian baptism.', 
'video', 
'{"video_url": "https://example.com/christian-baptism.mp4", "thumbnail": "https://example.com/baptism-thumbnail.jpg", "transcript": "Baptism is one of the most important sacraments in Christianity. It symbolizes death to sin and rebirth in Christ...", "symbolism": ["Water represents cleansing", "Immersion symbolizes death and rebirth", "Emergence represents new life in Christ", "Community witnesses the commitment"], "types": ["Infant baptism", "Adult baptism", "Immersion", "Sprinkling", "Pouring"], "significance": "Baptism marks the beginning of a Christians spiritual journey and membership in the Church."}', 
12, 2, true),

-- Islam - Prayer Demonstration
((SELECT id FROM learning_paths WHERE title = 'Islamic History and Culture'), 
'How to Perform Salah', 
'Step-by-step guide to performing the Islamic prayer.', 
'video', 
'{"video_url": "https://example.com/salah-prayer.mp4", "thumbnail": "https://example.com/salah-thumbnail.jpg", "transcript": "Salah is performed five times daily by Muslims. We will learn the proper movements and recitations...", "preparation": ["Perform wudu (ablution)", "Face the Qibla (direction of Mecca)", "Stand on clean ground or prayer mat", "Ensure proper dress"], "prayer_positions": ["Qiyam (standing)", "Ruku (bowing)", "Sujud (prostration)", "Jalsa (sitting)", "Tashahhud (testimony)"], "recitations": ["Takbir (Allah is Greatest)", "Surah Al-Fatiha", "Additional Quran verses", "Dhikr (remembrance)", "Final salutations"]}', 
20, 2, true);

-- 3. Add interactive meditation guides
INSERT INTO lessons (path_id, title, description, type, content, duration, order_index, is_published) VALUES

-- Buddhism - Interactive Meditation
((SELECT id FROM learning_paths WHERE title = 'Mindfulness & Meditation'), 
'Mindfulness of Breathing', 
'Interactive breath awareness meditation with timer and guidance.', 
'interactive', 
'{"meditation_type": "breath_awareness", "timer_options": [5, 10, 15, 20, 30], "guidance_intervals": [1, 2, 5], "instructions": "Focus your attention on the natural rhythm of your breathing. When your mind wanders, gently return to the breath.", "progressive_steps": ["Notice breathing without changing it", "Focus on nostrils or abdomen", "Count breaths from 1 to 10", "Simply observe without counting", "Maintain awareness"], "customization": {"background_sounds": ["Silence", "Nature sounds", "Soft music", "Tibetan bowls"], "reminder_frequency": ["Every minute", "Every 2 minutes", "Every 5 minutes", "Only at start/end"]}, "benefits": ["Calms the mind", "Reduces anxiety", "Improves focus", "Develops mindfulness"]}', 
25, 4, true),

-- Christianity - Contemplative Prayer
((SELECT id FROM learning_paths WHERE title = 'Christian Ethics and Morality'), 
'Lectio Divina Practice', 
'Interactive divine reading meditation with scripture.', 
'interactive', 
'{"prayer_type": "lectio_divina", "scripture_passages": ["Psalm 23", "Matthew 5:3-12", "John 3:16", "Romans 8:28", "Philippians 4:6-7"], "four_steps": ["Lectio (Reading)", "Meditatio (Meditation)", "Oratio (Prayer)", "Contemplatio (Contemplation)"], "timer_settings": {"reading": 2, "meditation": 5, "prayer": 5, "contemplation": 10}, "guidance": "Read the passage slowly, meditate on a word or phrase that speaks to you, pray about it, then rest in Gods presence.", "customization": {"pace": ["Slow", "Medium", "Fast"], "prompts": ["Frequent", "Occasional", "Minimal"], "music": ["Gregorian chant", "Instrumental", "Silence"]}}', 
22, 3, true),

-- Hinduism - Mantra Meditation
((SELECT id FROM learning_paths WHERE title = 'Hindu Deities and Stories'), 
'Om Meditation Practice', 
'Interactive mantra meditation using the sacred sound Om.', 
'interactive', 
'{"meditation_type": "mantra", "primary_mantra": "Om", "pronunciation": "AUM (Ah-Ooh-Mm)", "meaning": "The sound of the universe, representing the divine", "practice_modes": ["Silent repetition", "Whispered", "Chanted aloud", "Mental focus"], "timer_options": [10, 15, 20, 30, 45], "guidance": "Sit comfortably, close your eyes, and repeat Om either silently or aloud. Focus on the vibration and meaning.", "advanced_mantras": ["Om Namah Shivaya", "Om Mani Padme Hum", "So Hum", "Sat Chit Ananda"], "benefits": ["Connects with cosmic consciousness", "Calms the mind", "Vibrates through the body", "Spiritual awakening"]}', 
18, 3, true),

-- Judaism - Meditative Prayer
((SELECT id FROM learning_paths WHERE title = 'Jewish Holidays and Festivals'), 
'Shema Meditation', 
'Contemplative practice with the central Jewish prayer.', 
'interactive', 
'{"prayer_type": "shema_meditation", "hebrew_text": "שְׁמַע יִשְׂרָאֵל יי אֱלֹהֵינוּ יי אֶחָד", "transliteration": "Shema Yisrael Adonai Eloheinu Adonai Echad", "translation": "Hear, O Israel, the Lord our God, the Lord is One", "meditation_focus": ["Unity of God", "Jewish identity", "Divine presence", "Monotheism"], "practice_options": ["Silent contemplation", "Rhythmic recitation", "Visualization", "Heart-centered focus"], "timer_settings": [8, 12, 18, 25], "guidance": "Reflect deeply on the oneness of God and your connection to the Jewish people throughout history."}', 
15, 3, true),

-- Islam - Dhikr Practice
((SELECT id FROM learning_paths WHERE title = 'Islamic History and Culture'), 
'Remembrance of Allah (Dhikr)', 
'Interactive practice of remembering and glorifying Allah.', 
'interactive', 
'{"practice_type": "dhikr", "primary_phrases": ["La ilaha illa Allah (No god but Allah)", "Allahu Akbar (Allah is Greatest)", "Subhan Allah (Glory be to Allah)", "Alhamdulillah (Praise be to Allah)"], "repetition_counts": [33, 99, 100, 500, 1000], "method_options": ["Vocal recitation", "Silent remembrance", "With prayer beads", "Breath coordination"], "timer_options": [10, 15, 20, 30, 45], "guidance": "Choose a phrase and repeat it with full concentration, remembering Allah with your heart, tongue, and mind.", "benefits": ["Purifies the heart", "Increases faith", "Brings peace", "Connects with Allah"], "advanced_practices": ["99 Names of Allah", "Istighfar (seeking forgiveness)", "Salawat (blessings on Prophet)", "Tasbih (glorification)"]}', 
20, 3, true);

-- 4. Add reflection and journaling lessons
INSERT INTO lessons (path_id, title, description, type, content, duration, order_index, is_published) VALUES

-- Interfaith - Reflection Content
((SELECT id FROM learning_paths WHERE title = 'Common Values'), 
'Gratitude Across Traditions', 
'Reflect on gratitude practices from different spiritual traditions.', 
'reflection', 
'{"theme": "gratitude", "traditions": {"Buddhism": "Appreciation for interconnectedness", "Christianity": "Thankfulness to God", "Islam": "Shukr - gratitude to Allah", "Judaism": "Berachot - blessings for everyday moments", "Hinduism": "Krita-jna - recognizing divine gifts"}, "reflection_prompts": ["What are you most grateful for in your life?", "How does gratitude change your perspective?", "What blessings do you sometimes take for granted?", "How can you express gratitude daily?"], "journaling_exercises": ["Daily gratitude list", "Letter to someone who impacted you", "Gratitude for challenges that taught you", "Appreciation for simple pleasures"], "practices": ["Morning gratitude meditation", "Gratitude walk in nature", "Sharing appreciation with others", "Gratitude prayer before meals"]}', 
25, 4, true),

-- Christianity - Spiritual Reflection
((SELECT id FROM learning_paths WHERE title = 'Christian Ethics and Morality'), 
'Examining Your Spiritual Life', 
'Reflect on your relationship with God and spiritual growth.', 
'reflection', 
'{"theme": "spiritual_examination", "scripture_basis": "1 Corinthians 11:28 - Let a person examine himself", "reflection_areas": ["Prayer life", "Love for others", "Forgiveness", "Service", "Faith journey"], "guided_questions": ["How has God been present in your life recently?", "What areas of your character need growth?", "How are you serving others?", "What is God calling you to do?"], "prayer_exercises": ["Confession and forgiveness", "Intercessory prayer", "Contemplative prayer", "Scripture meditation"], "spiritual_practices": ["Daily devotions", "Bible study", "Fellowship", "Acts of service", "Worship"]}', 
30, 4, true),

-- Buddhism - Mindful Reflection
((SELECT id FROM learning_paths WHERE title = 'Buddhist Philosophy'), 
'Reflecting on Interdependence', 
'Contemplate the Buddhist teaching of interconnectedness.', 
'reflection', 
'{"theme": "interdependence", "teaching_basis": "Pratityasamutpada - dependent origination", "contemplation_areas": ["Relationships with others", "Connection to nature", "Dependence on community", "Spiritual interconnection"], "guided_inquiry": ["How are you connected to all beings?", "What conditions support your existence?", "How do your actions affect others?", "What does it mean to be interdependent?"], "meditation_practices": ["Loving-kindness for all beings", "Contemplating food chain", "Reflecting on teachers and mentors", "Sensing unity with nature"], "wisdom_cultivation": ["Compassion for all", "Reducing self-centeredness", "Appreciation for others", "Environmental consciousness"]}', 
25, 3, true);

-- 5. Update lesson counts
UPDATE learning_paths 
SET total_lessons = (
    SELECT COUNT(*) 
    FROM lessons 
    WHERE lessons.path_id = learning_paths.id 
    AND lessons.is_published = true
);

-- 6. Add achievements for multimedia content
INSERT INTO achievements (title, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
('Meditation Master', 'Complete 5 meditation or prayer audio lessons', '🧘', 'participation', 'audio_lessons', 5, 200),
('Visual Learner', 'Watch 3 video lessons about religious practices', '📹', 'participation', 'video_lessons', 3, 150),
('Interactive Explorer', 'Complete 3 interactive meditation guides', '🎯', 'participation', 'interactive_lessons', 3, 175),
('Reflective Soul', 'Complete 3 reflection and journaling exercises', '📝', 'participation', 'reflection_lessons', 3, 125),
('Multimedia Student', 'Try all content types: reading, audio, video, interactive', '🎬', 'participation', 'content_variety', 4, 400);

COMMIT;