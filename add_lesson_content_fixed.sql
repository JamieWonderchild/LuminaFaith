-- LuminaFaith: Additional Lesson Content (Fixed)
-- Execute this in your Supabase SQL Editor to add more comprehensive lesson content

-- 1. Add more lessons to existing paths
INSERT INTO lessons (path_id, title, description, type, content, duration, order_index, is_published) VALUES
-- Christianity lessons
((SELECT id FROM learning_paths WHERE title = 'Introduction to Christianity'), 
'The Life of Jesus', 
'Learn about the birth, ministry, and teachings of Jesus Christ.', 
'reading', 
'{"text": "Jesus was born in Bethlehem and grew up in Nazareth. His ministry began when he was about 30 years old. He taught about love, compassion, and forgiveness. Jesus performed miracles and gathered disciples who followed his teachings. His life and sacrifice are central to Christian faith.", "questions": [{"id": "q1", "type": "multiple-choice", "question": "Where was Jesus born?", "options": ["Jerusalem", "Nazareth", "Bethlehem", "Galilee"], "correct_answer": "Bethlehem", "explanation": "According to Christian tradition, Jesus was born in Bethlehem."}]}', 
12, 3, true),

((SELECT id FROM learning_paths WHERE title = 'Introduction to Christianity'), 
'The Ten Commandments', 
'Explore the fundamental moral laws given by God to Moses.', 
'reading', 
'{"text": "The Ten Commandments are fundamental moral laws in Christianity. They include: 1) You shall have no other gods before Me, 2) You shall not make idols, 3) You shall not take the Lords name in vain, 4) Remember the Sabbath day, 5) Honor your father and mother, 6) You shall not murder, 7) You shall not commit adultery, 8) You shall not steal, 9) You shall not bear false witness, 10) You shall not covet.", "questions": [{"id": "q1", "type": "multiple-choice", "question": "How many commandments are there?", "options": ["5", "8", "10", "12"], "correct_answer": "10", "explanation": "There are ten commandments given by God to Moses."}]}', 
15, 4, true),

((SELECT id FROM learning_paths WHERE title = 'Introduction to Christianity'), 
'Christian Prayer', 
'Learn about the importance and practice of prayer in Christianity.', 
'practice', 
'{"instructions": "Prayer is communication with God. Christians pray to give thanks, ask for guidance, and seek forgiveness. The Lords Prayer is a model prayer taught by Jesus.", "duration": 10, "steps": ["Find a quiet place", "Begin with gratitude", "Speak from your heart", "Listen in silence", "End with Amen"], "prayer_text": "Our Father, who art in heaven, hallowed be thy name. Thy kingdom come, thy will be done, on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us. And lead us not into temptation, but deliver us from evil. For thine is the kingdom, and the power, and the glory, forever and ever. Amen."}', 
10, 5, true),

-- Buddhism lessons
((SELECT id FROM learning_paths WHERE title = 'Buddhist Foundations'), 
'The Eightfold Path', 
'Understand the path to enlightenment through eight interconnected practices.', 
'reading', 
'{"text": "The Noble Eightfold Path is the fourth of the Four Noble Truths. It consists of: 1) Right Understanding, 2) Right Intention, 3) Right Speech, 4) Right Action, 5) Right Livelihood, 6) Right Effort, 7) Right Mindfulness, 8) Right Concentration. These practices work together to lead to liberation from suffering.", "questions": [{"id": "q1", "type": "multiple-choice", "question": "How many practices are in the Eightfold Path?", "options": ["4", "6", "8", "10"], "correct_answer": "8", "explanation": "The Eightfold Path consists of eight interconnected practices."}]}', 
18, 2, true),

((SELECT id FROM learning_paths WHERE title = 'Buddhist Foundations'), 
'Understanding Karma', 
'Learn about the law of cause and effect in Buddhism.', 
'reading', 
'{"text": "Karma is the law of cause and effect in Buddhism. Every action has consequences that affect our future experiences. Good actions lead to positive outcomes, while harmful actions lead to suffering. Understanding karma helps us make wise choices and take responsibility for our actions.", "questions": [{"id": "q1", "type": "multiple-choice", "question": "What is karma?", "options": ["Luck", "Fate", "Law of cause and effect", "Destiny"], "correct_answer": "Law of cause and effect", "explanation": "Karma is the Buddhist principle that every action has consequences."}]}', 
16, 3, true),

-- Islam lessons
((SELECT id FROM learning_paths WHERE title = 'The Five Pillars'), 
'Salah - The Five Daily Prayers', 
'Learn about the importance and practice of the five daily prayers in Islam.', 
'reading', 
'{"text": "Salah is the second pillar of Islam. Muslims pray five times a day: Fajr (dawn), Dhuhr (midday), Asr (afternoon), Maghrib (sunset), and Isha (night). Prayer is performed facing Mecca and includes specific movements and recitations. It connects Muslims with Allah and provides spiritual discipline.", "questions": [{"id": "q1", "type": "multiple-choice", "question": "How many times do Muslims pray each day?", "options": ["3", "4", "5", "6"], "correct_answer": "5", "explanation": "Muslims perform five daily prayers as part of their religious obligation."}]}', 
14, 2, true),

((SELECT id FROM learning_paths WHERE title = 'The Five Pillars'), 
'Zakat - Giving to Charity', 
'Understand the importance of charitable giving in Islam.', 
'reading', 
'{"text": "Zakat is the third pillar of Islam. It is a form of almsgiving and religious tax. Muslims who are financially able must give a portion of their wealth to help the poor and needy. Zakat purifies wealth and helps create a just society where everyones basic needs are met.", "questions": [{"id": "q1", "type": "multiple-choice", "question": "What is Zakat?", "options": ["Prayer", "Fasting", "Pilgrimage", "Charitable giving"], "correct_answer": "Charitable giving", "explanation": "Zakat is the Islamic practice of giving to charity and helping those in need."}]}', 
12, 3, true),

-- Interfaith lessons
((SELECT id FROM learning_paths WHERE title = 'Common Values'), 
'Compassion Across Faiths', 
'Explore how different religions teach compassion and kindness.', 
'reading', 
'{"text": "Compassion is a universal value across all major religions. Buddhism emphasizes loving-kindness, Christianity teaches love for neighbors, Islam promotes mercy and kindness, Judaism values chesed (loving-kindness), and Hinduism speaks of ahimsa (non-violence). Despite different expressions, all faiths encourage us to be compassionate toward others.", "questions": [{"id": "q1", "type": "multiple-choice", "question": "Which value is common across all major religions?", "options": ["Wealth", "Power", "Compassion", "Fame"], "correct_answer": "Compassion", "explanation": "Compassion and kindness are universal values taught by all major religions."}]}', 
16, 2, true),

((SELECT id FROM learning_paths WHERE title = 'Common Values'), 
'Sacred Texts and Wisdom', 
'Discover the wisdom found in different religious texts.', 
'reading', 
'{"text": "Every major religion has sacred texts that contain wisdom and guidance. The Bible guides Christians, the Quran guides Muslims, the Torah guides Jews, the Tripitaka guides Buddhists, and the Vedas guide Hindus. While the texts differ, they all contain teachings about how to live a meaningful and ethical life.", "questions": [{"id": "q1", "type": "multiple-choice", "question": "What is the sacred text of Islam?", "options": ["Bible", "Torah", "Quran", "Vedas"], "correct_answer": "Quran", "explanation": "The Quran is the holy book of Islam, believed to be the word of Allah."}]}', 
14, 3, true);

-- 2. Add more learning paths
INSERT INTO learning_paths (religion_id, title, description, level, order_index, is_published) VALUES
-- Christianity advanced path
((SELECT id FROM religions WHERE name = 'christianity'), 
'Christian Ethics and Morality', 
'Explore Christian teachings on how to live a moral and ethical life.', 
'intermediate', 2, true),

-- Buddhism intermediate path  
((SELECT id FROM religions WHERE name = 'buddhism'), 
'Buddhist Philosophy', 
'Delve deeper into Buddhist philosophical concepts and teachings.', 
'intermediate', 3, true),

-- Islam intermediate path
((SELECT id FROM religions WHERE name = 'islam'), 
'Islamic History and Culture', 
'Learn about the rich history and cultural contributions of Islam.', 
'intermediate', 2, true),

-- Judaism beginner path
((SELECT id FROM religions WHERE name = 'judaism'), 
'Jewish Holidays and Festivals', 
'Understand the significance of major Jewish holidays and celebrations.', 
'beginner', 2, true),

-- Hinduism intermediate path
((SELECT id FROM religions WHERE name = 'hinduism'), 
'Hindu Deities and Stories', 
'Explore the rich mythology and stories of Hindu deities.', 
'intermediate', 2, true);

-- 3. Add lessons to the new paths
INSERT INTO lessons (path_id, title, description, type, content, duration, order_index, is_published) VALUES
-- Christian Ethics lessons
((SELECT id FROM learning_paths WHERE title = 'Christian Ethics and Morality'), 
'The Sermon on the Mount', 
'Study Jesus teachings on how to live a blessed life.', 
'reading', 
'{"text": "The Sermon on the Mount contains some of Jesus most important teachings. The Beatitudes describe the characteristics of those who are blessed: the poor in spirit, those who mourn, the meek, those who hunger for righteousness, the merciful, the pure in heart, the peacemakers, and those persecuted for righteousness. These teachings form the foundation of Christian ethics.", "questions": [{"id": "q1", "type": "multiple-choice", "question": "What are the Beatitudes?", "options": ["Laws", "Blessings", "Prayers", "Songs"], "correct_answer": "Blessings", "explanation": "The Beatitudes are Jesus teachings about who is blessed by God."}]}', 
20, 1, true),

-- Buddhist Philosophy lessons
((SELECT id FROM learning_paths WHERE title = 'Buddhist Philosophy'), 
'The Concept of Impermanence', 
'Understand the Buddhist teaching that all things are temporary.', 
'reading', 
'{"text": "Impermanence (anicca) is one of the three marks of existence in Buddhism. Everything in the universe is constantly changing - our bodies, thoughts, emotions, and circumstances. Understanding impermanence helps us accept change and reduces our attachment to temporary things, leading to less suffering.", "questions": [{"id": "q1", "type": "multiple-choice", "question": "What does impermanence mean?", "options": ["Everything is permanent", "Nothing changes", "All things are temporary", "Only some things change"], "correct_answer": "All things are temporary", "explanation": "Impermanence teaches that all phenomena are constantly changing and temporary."}]}', 
18, 1, true),

-- Jewish Holidays lessons
((SELECT id FROM learning_paths WHERE title = 'Jewish Holidays and Festivals'), 
'Passover - The Festival of Freedom', 
'Learn about the most important Jewish holiday celebrating freedom from slavery.', 
'reading', 
'{"text": "Passover commemorates the Exodus of the Israelites from slavery in Egypt. During this eight-day festival, Jews retell the story of liberation through the Seder meal. Matzah (unleavened bread) is eaten to remember the haste of the departure. Passover teaches about freedom, redemption, and the importance of remembering history.", "questions": [{"id": "q1", "type": "multiple-choice", "question": "What does Passover celebrate?", "options": ["New Year", "Harvest", "Freedom from slavery", "Day of Atonement"], "correct_answer": "Freedom from slavery", "explanation": "Passover celebrates the liberation of the Israelites from slavery in Egypt."}]}', 
16, 1, true),

-- Hindu Deities lessons
((SELECT id FROM learning_paths WHERE title = 'Hindu Deities and Stories'), 
'Ganesha - The Remover of Obstacles', 
'Learn about the beloved elephant-headed deity in Hinduism.', 
'reading', 
'{"text": "Ganesha is one of the most beloved deities in Hinduism. With the head of an elephant and the body of a human, Ganesha is known as the remover of obstacles and the patron of arts and sciences. Hindus often pray to Ganesha before beginning new ventures. The deity represents wisdom, prosperity, and good fortune.", "questions": [{"id": "q1", "type": "multiple-choice", "question": "What is Ganesha known as?", "options": ["Creator of the universe", "Remover of obstacles", "God of war", "Goddess of wealth"], "correct_answer": "Remover of obstacles", "explanation": "Ganesha is revered as the remover of obstacles and bringer of good fortune."}]}', 
14, 1, true),

-- Islamic History lessons
((SELECT id FROM learning_paths WHERE title = 'Islamic History and Culture'), 
'The Prophet Muhammad', 
'Learn about the life and teachings of the Prophet Muhammad.', 
'reading', 
'{"text": "Muhammad is the founder and central figure of Islam. Born in Mecca around 570 CE, he received revelations from Allah through the angel Gabriel. These revelations became the Quran. Muhammad taught about monotheism, social justice, and moral conduct. His teachings and example form the foundation of Islamic faith and practice.", "questions": [{"id": "q1", "type": "multiple-choice", "question": "Where was Muhammad born?", "options": ["Medina", "Mecca", "Jerusalem", "Baghdad"], "correct_answer": "Mecca", "explanation": "The Prophet Muhammad was born in Mecca in what is now Saudi Arabia."}]}', 
18, 1, true);

-- 4. Add more achievements
INSERT INTO achievements (title, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
('Interfaith Explorer', 'Complete lessons from 5 different religions', '🌍', 'participation', 'religions_completed', 5, 300),
('Perfect Score', 'Score 100% on any quiz', '💯', 'accuracy', 'perfect_quiz', 1, 100),
('Morning Learner', 'Complete 5 lessons before noon', '🌅', 'participation', 'morning_lessons', 5, 150),
('Consistent Learner', 'Complete at least one lesson every day for 30 days', '📚', 'streak', 'daily_consistency', 30, 500),
('Wisdom Seeker', 'Complete 25 lessons total', '🧠', 'completion', 'total_lessons', 25, 250),
('Compassion Champion', 'Complete all lessons about compassion and kindness', '❤️', 'participation', 'compassion_lessons', 3, 200);

-- 5. Update the total_lessons count for all paths
UPDATE learning_paths 
SET total_lessons = (
    SELECT COUNT(*) 
    FROM lessons 
    WHERE lessons.path_id = learning_paths.id 
    AND lessons.is_published = true
);

-- 6. Update the total_paths count for all religions
UPDATE religions 
SET total_paths = (
    SELECT COUNT(*) 
    FROM learning_paths 
    WHERE learning_paths.religion_id = religions.id 
    AND learning_paths.is_published = true
);

COMMIT;