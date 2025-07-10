# 📁 Project Structure

LuminaFaith follows a clean, scalable architecture optimized for React Native development.

## 🗂️ Directory Structure

```
LuminaFaith/
├── 📱 src/                          # Main application source
│   ├── 🧩 components/               # Reusable UI components
│   │   ├── common/                  # Shared components
│   │   │   ├── AnimatedButton.tsx
│   │   │   ├── AnimatedCard.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── __tests__/           # Component tests
│   │   └── lesson/                  # Lesson-specific components
│   │       ├── LessonCard.tsx
│   │       └── __tests__/
│   ├── 📺 screens/                  # App screens/pages
│   │   ├── HomeScreen.tsx
│   │   ├── PathsScreen.tsx
│   │   ├── LessonScreen.tsx
│   │   ├── CommunityScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── 🗄️ store/                    # State management
│   │   ├── AppContext.tsx           # Global app state
│   │   └── __tests__/
│   ├── 🪝 hooks/                    # Custom React hooks
│   │   └── usePersistence.ts        # State persistence
│   ├── 📊 data/                     # Static data & content
│   │   └── religions.ts             # Faith traditions data
│   ├── 🔧 utils/                    # Helper functions
│   ├── 🏷️ types/                    # TypeScript definitions
│   │   └── index.ts
│   └── 🧪 tests/                    # Test utilities & integration
│       ├── integration/
│       ├── utils/
│       └── setup.ts
├── 📚 docs/                         # Documentation
│   ├── development/                 # Dev guides
│   ├── user-guide/                  # User documentation
│   └── api/                         # API reference
├── 🎨 assets/                       # Images, fonts, icons
├── 🏗️ .github/                     # GitHub workflows
│   └── workflows/
│       └── ci.yml
├── ⚙️ Configuration Files
│   ├── package.json
│   ├── tsconfig.json
│   ├── babel.config.js
│   ├── jest.config.js
│   └── metro.config.js
└── 📖 README.md
```

## 🎯 Architecture Principles

### 🏗️ **Component Architecture**
- **Atomic Design**: Base components → Complex screens
- **Composition over Inheritance**: Flexible, reusable components
- **Single Responsibility**: Each component has one clear purpose

### 📱 **Screen Organization**
```tsx
// Each screen follows this pattern:
Screen.tsx
├── Imports (dependencies, components, hooks)
├── Interface definitions
├── Main component logic
├── Styles (StyleSheet)
└── Export
```

### 🗄️ **State Management**
- **Context API**: Global state (user, progress, achievements)
- **Local State**: Component-specific state
- **Persistence**: Automatic state hydration/persistence

### 🔧 **Import Strategy**
```tsx
// Preferred import order:
import React from 'react';                    // React
import { View, Text } from 'react-native';   // React Native
import { LinearGradient } from 'expo-*';     // Expo
import { useUser } from '@/store/AppContext'; // Internal store
import Card from '@/components/common/Card';  // Internal components
import { Lesson } from '@/types';             // Internal types
```

## 🎨 **Styling Conventions**

### 🌈 **Color System**
```tsx
// Dark theme palette
const colors = {
  background: '#0F0F23',      // Deep navy
  surface: '#1E293B',         // Dark slate
  primary: '#8B5CF6',         // Purple
  secondary: '#A78BFA',       // Light purple
  text: '#FFFFFF',            // White
  textSecondary: '#E2E8F0',   // Light gray
  textMuted: '#CBD5E1',       // Medium gray
};
```

### 📏 **Spacing System**
```tsx
const spacing = {
  xs: 4,    // Micro spacing
  sm: 8,    // Small spacing
  md: 16,   // Standard spacing
  lg: 24,   // Large spacing
  xl: 32,   // Extra large spacing
};
```

## 🧪 **Testing Strategy**

### 📋 **Test Organization**
- **Unit Tests**: `__tests__/` alongside components
- **Integration Tests**: `src/tests/integration/`
- **Test Utils**: `src/tests/utils/`

### 🎯 **Coverage Goals**
- **Components**: 90%+ coverage
- **Hooks**: 95%+ coverage
- **Utils**: 100% coverage
- **Overall**: 80%+ threshold

## 📦 **Package Management**

### 🛠️ **Dependencies**
- **Runtime**: Production dependencies
- **DevDependencies**: Development tools only
- **PeerDependencies**: Expo/RN framework deps

### 📌 **Version Strategy**
- **Expo SDK**: Lock to specific version (53.x)
- **React Native**: Expo-compatible version
- **Third-party**: Semantic versioning with ^ prefix

---

This structure ensures:
✅ **Scalability** - Easy to add new features
✅ **Maintainability** - Clear separation of concerns  
✅ **Testability** - Isolated, testable components
✅ **Developer Experience** - Intuitive organization