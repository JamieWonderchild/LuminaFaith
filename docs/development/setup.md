# 🛠️ Development Setup

Complete setup guide for LuminaFaith development environment.

## 📋 Prerequisites

### Required Software
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 8+ (comes with Node.js)
- **Expo CLI** `npm install -g @expo/cli`
- **Git** ([Download](https://git-scm.com/))

### Mobile Development
- **iOS**: Xcode 14+ (macOS only)
- **Android**: Android Studio with API 33+
- **Device Testing**: Expo Go app ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repository-url>
cd LuminaFaith
npm install
```

### 2. Start Development
```bash
npm start
# Scan QR code with Expo Go app
```

### 3. Run Tests
```bash
npm test              # Run tests once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

### 4. Code Quality
```bash
npm run lint          # Check code style
npm run lint:fix      # Auto-fix issues
npm run type-check    # TypeScript validation
```

## 🏗️ Project Structure

```
LuminaFaith/
├── 📱 src/                    # Main source code
│   ├── 🧩 components/         # UI components
│   ├── 📺 screens/           # App screens
│   ├── 🗄️ store/             # State management
│   ├── 🪝 hooks/             # Custom hooks
│   ├── 🔧 utils/             # Helper functions
│   ├── 📊 data/              # Static data
│   ├── 🏷️ types/             # TypeScript types
│   └── 🧪 tests/             # Test utilities
├── 📚 docs/                   # Documentation
├── 🎨 assets/                 # Images & icons
└── ⚙️ config files
```

## 🔧 Development Tools

### Code Quality
- **TypeScript**: Strict type checking
- **ESLint**: Code linting with Airbnb config
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks

### Testing
- **Jest**: Test runner
- **React Native Testing Library**: Component testing
- **Coverage**: 80%+ threshold

### State Management
- **React Context**: Global state
- **AsyncStorage**: Data persistence
- **Custom Hooks**: Encapsulated logic

## 📱 Running on Devices

### Expo Go (Recommended for Development)
1. Install Expo Go on your phone
2. Run `npm start`
3. Scan QR code from terminal

### iOS Simulator (macOS only)
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

## 🐛 Common Issues & Solutions

### Metro Bundle Error
```bash
# Clear cache and restart
npx expo start --clear
```

### Module Resolution Issues
```bash
# Restart with cache clear
rm -rf node_modules
npm install
npx expo start --clear
```

### TypeScript Errors
```bash
# Check types
npm run type-check
```

### Storage/Persistence Issues
```bash
# Clear app data (development)
# In Expo Go: Shake device → Clear cache
```

## 🔄 Development Workflow

### 1. Feature Development
```bash
git checkout -b feature/new-feature
# Make changes
npm test
npm run lint
git commit -m "Add new feature"
```

### 2. Quality Checks
```bash
npm run lint          # Code style
npm run type-check    # TypeScript
npm run test:coverage # Test coverage
```

### 3. Pre-commit Hooks
Automatically runs:
- ESLint checks
- Prettier formatting
- Type checking
- Test suite

## 🌍 Environment Setup

### Development
```bash
NODE_ENV=development
EXPO_ENVIRONMENT=development
```

### Testing
```bash
NODE_ENV=test
```

## 📊 Performance Monitoring

### Bundle Analysis
```bash
npx expo bundle-size
```

### Performance Profiling
- Use React DevTools Profiler
- Monitor render cycles
- Check for memory leaks

## 🤝 Contributing Guidelines

1. **Code Style**: Follow ESLint + Prettier
2. **Testing**: Write tests for new features
3. **Types**: Use proper TypeScript types
4. **Commits**: Use conventional commit format
5. **Documentation**: Update docs for API changes

## 🆘 Getting Help

- **Documentation**: Check `/docs` folder
- **Issues**: GitHub Issues
- **Testing**: Run `npm run test:watch`
- **Types**: Use VS Code TypeScript IntelliSense

---

**Happy Coding! 🙏**