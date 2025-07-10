# 🙏 LuminaFaith

*A mindful spiritual learning platform for exploring faith traditions with wisdom and respect.*

[![CI/CD](https://github.com/username/luminafaith/workflows/CI/badge.svg)](https://github.com/username/luminafaith/actions)
[![Coverage](https://codecov.io/gh/username/luminafaith/branch/main/graph/badge.svg)](https://codecov.io/gh/username/luminafaith)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> **Phase A Status**: ✅ Production-ready MVP with persistence & error handling

## 🎯 Overview

LuminaFaith makes learning about world religions engaging, interactive, and accessible. Users can explore Buddhism, Christianity, Islam, Hinduism, Judaism, and interfaith studies through bite-sized lessons, quizzes, and community discussions.

## ✨ Features

### 🏠 Core Functionality
- **Multi-religion support** - Explore 6+ religious traditions
- **Interactive lessons** - Reading, quizzes, audio, video content
- **Gamification system** - XP, levels, streaks, achievements
- **Progress tracking** - Detailed analytics and learning insights
- **Community features** - Discussions, study groups, Q&A
- **Offline capability** - Download lessons for offline study

### 🎨 UI/UX Excellence
- **Smooth animations** - React Native Reanimated powered transitions
- **Responsive design** - Optimized for all screen sizes
- **Loading states** - Skeleton screens and smooth transitions
- **Accessibility** - Screen reader support and high contrast
- **Dark theme** - ✅ Serene purple & blue palette

### 🧪 Quality Assurance
- **Comprehensive testing** - Unit, integration, and E2E tests
- **TypeScript** - Full type safety throughout
- **ESLint & Prettier** - Code quality and formatting
- **CI/CD ready** - Automated testing and deployment

## 🚀 Quick Start

### Option 1: Docker Setup (Recommended for New Users)
```bash
# 1. Install Docker Desktop
# 2. Clone this repository
git clone https://github.com/JamieWonderchild/LuminaFaith.git
cd LuminaFaith

# 3. Get the .env file from Jamie
# 4. Start the app
docker-compose up
```

> **New to the project?** Check out our [Docker Setup Guide](./DOCKER_SETUP_GUIDE.md) - it's much simpler!

### Option 2: Local Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm start

# Scan QR code with Expo Go app
```

> **For local development setup:** Check out our [Complete Setup Guide](./docs/development/setup.md)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests for CI
npm run test:ci
```

## 🏗️ Architecture

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Card, etc.)
│   ├── lesson/         # Lesson-specific components
│   └── navigation/     # Navigation components
├── screens/            # Screen components
├── store/              # State management (Context API)
├── services/           # API calls and external services
├── utils/              # Helper functions
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
├── data/               # Mock data and constants
├── assets/             # Images, fonts, sounds
└── tests/              # Test utilities and integration tests
```

### Key Technologies
- **Framework**: React Native + Expo SDK 53
- **Language**: TypeScript (strict mode)
- **State**: React Context + AsyncStorage persistence
- **Navigation**: React Navigation 6
- **Testing**: Jest + React Native Testing Library
- **Styling**: StyleSheet with dark theme
- **Quality**: ESLint + Prettier + Husky

## 📖 Learning Paths

### Available Religions
- 🧘 **Buddhism** - Four Noble Truths, meditation, mindfulness
- ✝️ **Christianity** - Life of Jesus, parables, Christian values
- ☪️ **Islam** - Five Pillars, Quran teachings, Islamic practices
- 🕉️ **Hinduism** - Ancient wisdom, diverse traditions, yoga
- ✡️ **Judaism** - Jewish history, traditions, culture
- 🌍 **Interfaith Studies** - Comparative religion, common values

### Lesson Types
- 📖 **Reading** - Texts, stories, historical context
- ❓ **Quiz** - Multiple choice, true/false, matching
- 🎧 **Audio** - Guided meditations, prayers, chants
- 📹 **Video** - Documentary clips, ritual demonstrations
- 🎮 **Interactive** - Drag & drop, timeline activities
- 💭 **Reflection** - Journaling prompts, discussion questions

## 🎮 Gamification

### Progress System
- **XP Points** - Earned through lesson completion and accuracy
- **Levels** - Unlock new content and features
- **Streaks** - Daily learning consistency rewards
- **Achievements** - Milestone badges and special recognition

### Social Features
- **Community Discussions** - Topic-based conversations
- **Study Groups** - Private learning circles
- **Leaderboards** - Friendly competition
- **Peer Support** - Encouragement and Q&A

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with tests
4. Run the test suite: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Quality
```bash
# Lint your code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

## 📱 Screenshots

<div align="center">
  <img src="docs/screenshots/home.png" width="200" alt="Home Screen" />
  <img src="docs/screenshots/lesson.png" width="200" alt="Lesson Screen" />
  <img src="docs/screenshots/quiz.png" width="200" alt="Quiz Screen" />
  <img src="docs/screenshots/community.png" width="200" alt="Community Screen" />
</div>

## 🎯 Roadmap

### ✅ Phase A - Production MVP (Current)
- [x] Dark theme with serene UX
- [x] State persistence across sessions  
- [x] Error boundaries with graceful fallbacks
- [x] CI/CD pipeline with quality gates
- [ ] Sentry error tracking
- [ ] Firebase analytics
- [ ] 80%+ test coverage

### 🔄 Phase B - Enhanced Features  
- [ ] Offline lesson caching
- [ ] Push notifications
- [ ] Social sharing
- [ ] Advanced analytics
- [ ] Performance optimizations

### 🚀 Phase C - Scale & Polish
- [ ] Multi-language support
- [ ] Accessibility improvements  
- [ ] Advanced animations
- [ ] Premium features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Duolingo's innovative approach to learning
- Built with love for fostering interfaith understanding
- Special thanks to religious scholars and educators who provided content guidance
- Community contributors and beta testers

## 📚 Documentation

- 📖 [User Guide](./docs/user-guide/)
- 🛠️ [Development Docs](./docs/development/)
- 🔌 [API Reference](./docs/api/)
- 🎯 [Phase A Roadmap](./docs/development/setup-phase-a.md)

## 📊 Project Status

- **Development**: Active
- **Test Coverage**: 70%+ (targeting 80%)
- **Platform Support**: iOS + Android
- **Deployment**: Expo EAS Build

---

*"Peace comes from within. Do not seek it without." - Buddha*