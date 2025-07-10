# 🙏 LuminaFaith - Complete Setup Guide

*A comprehensive guide to get LuminaFaith running on your computer - from creating a GitHub account to running the app on your phone.*

## 📋 Table of Contents

1. [Prerequisites Setup](#prerequisites-setup)
2. [GitHub Account & Repository Setup](#github-account--repository-setup)
3. [Development Environment Setup](#development-environment-setup)
4. [Project Setup](#project-setup)
5. [Environment Configuration](#environment-configuration)
6. [Mobile App Setup](#mobile-app-setup)
7. [Running the Application](#running-the-application)
8. [Troubleshooting](#troubleshooting)
9. [Next Steps](#next-steps)

---

## Prerequisites Setup

### 1. Install Node.js

**What is Node.js?** Node.js is a JavaScript runtime that allows you to run JavaScript code outside of a web browser. We need it to run our React Native app.

#### For Windows:
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version (Long Term Support) - it will be the green button
3. Run the installer and follow the prompts
4. Accept all default settings
5. **Important**: Check the box that says "Automatically install the necessary tools"

#### For macOS:
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version
3. Open the downloaded .pkg file and follow the installer

#### For Linux (Ubuntu/Debian):
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Verify Installation:
Open Terminal (macOS/Linux) or Command Prompt (Windows) and run:
```bash
node --version
npm --version
```
You should see version numbers like `v18.17.0` and `9.6.7`

### 2. Install Git

**What is Git?** Git is a version control system that tracks changes in your code and allows you to collaborate with others.

#### For Windows:
1. Go to [git-scm.com](https://git-scm.com/)
2. Download Git for Windows
3. Run the installer
4. **Important settings during installation**:
   - Choose "Use Git from the Windows Command Prompt"
   - Choose "Checkout Windows-style, commit Unix-style line endings"
   - Choose "Use Windows' default console window"

#### For macOS:
Git is usually pre-installed. If not:
1. Install Xcode Command Line Tools: `xcode-select --install`
2. Or download from [git-scm.com](https://git-scm.com/)

#### For Linux:
```bash
sudo apt-get update
sudo apt-get install git
```

#### Verify Installation:
```bash
git --version
```

### 3. Install Expo CLI

**What is Expo?** Expo is a platform for building React Native apps. It provides tools and services to make development easier.

```bash
npm install -g @expo/cli
```

Verify installation:
```bash
expo --version
```

### 4. Install a Code Editor

**Recommended: Visual Studio Code**
1. Go to [code.visualstudio.com](https://code.visualstudio.com/)
2. Download and install for your operating system
3. **Recommended Extensions** (install these after opening VS Code):
   - React Native Tools
   - ES7+ React/Redux/React-Native snippets
   - Prettier - Code formatter
   - GitLens — Git supercharged

---

## GitHub Account & Repository Setup

### 1. Create GitHub Account
1. Go to [github.com](https://github.com/)
2. Click "Sign up" in the top right
3. Choose a username (this will be public)
4. Enter your email and create a password
5. Verify your email address

### 2. Clone the Repository
1. Go to [https://github.com/JamieWonderchild/LuminaFaith](https://github.com/JamieWonderchild/LuminaFaith)
2. Click the green "Code" button
3. Copy the HTTPS URL: `https://github.com/JamieWonderchild/LuminaFaith.git`
4. Open Terminal/Command Prompt
5. Navigate to where you want to store the project:
   ```bash
   cd Desktop  # or wherever you want to put it
   ```
6. Clone the repository:
   ```bash
   git clone https://github.com/JamieWonderchild/LuminaFaith.git
   ```
7. Navigate into the project folder:
   ```bash
   cd LuminaFaith
   ```

---

## Development Environment Setup

### 1. Install Project Dependencies
In your Terminal/Command Prompt, make sure you're in the LuminaFaith folder and run:
```bash
npm install
```

**This might take 5-10 minutes** - npm is downloading all the code libraries the app needs.

### 2. Check Everything is Working
Run this command to make sure everything installed correctly:
```bash
npm run type-check
```

If you see any errors, don't worry - we'll fix them in the troubleshooting section.

---

## Environment Configuration

**Important**: We'll be using a shared development environment, so you don't need to create your own database!

### 1. Get the Environment File
**Contact Jamie** to get the `.env` file with the shared database credentials. This file contains:
- Database connection details
- API keys
- Other configuration settings

### 2. Add the Environment File
1. Jamie will provide you with a `.env` file
2. Place this file in the root of your LuminaFaith folder (same level as `package.json`)
3. **Never commit this file to GitHub** - it contains sensitive information
4. The file should look something like this:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://shared-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=shared-anon-key-here
   EXPO_PUBLIC_PUSH_NOTIFICATIONS_PROJECT_ID=shared-project-id
   EXPO_PUBLIC_ANALYTICS_ENABLED=true
   EXPO_PUBLIC_ENVIRONMENT=development
   ```

### 3. Verify Environment Setup
Run this command to check if the environment is configured correctly:
```bash
npm start
```

If you see any "Supabase connection failed" errors, contact Jamie to verify your environment file.

---

## Mobile App Setup

### 1. Install Expo Go on Your Phone

#### For iPhone:
1. Open the App Store
2. Search for "Expo Go"
3. Install the app by Expo

#### For Android:
1. Open Google Play Store
2. Search for "Expo Go"
3. Install the app by Expo

### 2. Create Expo Account (Optional but Recommended)
1. Open the Expo Go app
2. Create an account with your email
3. This will make it easier to manage your projects

---

## Running the Application

### 1. Start the Development Server
1. In your Terminal/Command Prompt, make sure you're in the LuminaFaith folder
2. Run:
   ```bash
   npm start
   ```
3. You should see:
   - A QR code in your terminal
   - A web page opening in your browser with the same QR code
   - Text saying "Metro waiting on exp://..."

### 2. Open the App on Your Phone
1. Open the Expo Go app on your phone
2. **iPhone**: Use the camera app to scan the QR code
3. **Android**: Use the "Scan QR Code" button in Expo Go
4. The app should start loading on your phone

### 3. Test the App
1. The app should load and show a welcome screen
2. You can navigate through the app using the bottom tabs
3. Try signing up with a test email to make sure the shared database connection works
4. **Note**: You'll be sharing the same database with other developers, so you might see data from other users

---

## Troubleshooting

### Common Issues and Solutions

#### 1. "command not found: npm"
**Problem**: Node.js isn't installed correctly.
**Solution**: 
- Restart your Terminal/Command Prompt
- If still not working, reinstall Node.js from [nodejs.org](https://nodejs.org/)

#### 2. "npm install" fails with permission errors
**Problem**: Permission issues (common on Mac/Linux).
**Solution**:
```bash
sudo npm install -g @expo/cli
```

#### 3. "Unable to resolve module"
**Problem**: Metro bundler cache issues.
**Solution**:
```bash
npx expo start --clear
```

#### 4. App won't load on phone
**Problem**: Network or firewall issues.
**Solution**:
- Make sure your phone and computer are on the same WiFi network
- Try using the "Tunnel" option in Expo Dev Tools
- Check if your firewall is blocking the connection

#### 5. "Supabase connection failed"
**Problem**: Environment file is missing or incorrect.
**Solution**:
- Make sure you have the `.env` file from Jamie
- Check that the file is in the root folder (same level as `package.json`)
- Contact Jamie to verify the credentials are still valid

#### 6. TypeScript errors
**Problem**: Code style or type issues.
**Solution**:
```bash
npm run lint:fix
npm run type-check
```

#### 7. "Metro Bundle Error"
**Problem**: JavaScript bundling issues.
**Solution**:
```bash
# Clear cache and restart
rm -rf node_modules
npm install
npx expo start --clear
```

#### 8. Expo Go crashes or shows error screen
**Problem**: App compilation issues.
**Solution**:
- Check the Terminal for error messages
- Try restarting the development server
- Make sure you're using the latest version of Expo Go

#### 9. "Environment file not found"
**Problem**: The `.env` file is missing.
**Solution**:
- Contact Jamie to get the shared environment file
- Make sure the file is named exactly `.env` (not `.env.txt` or similar)
- Place it in the root directory of the project

### Getting Help

If you're still having trouble:
1. Check the Terminal/Command Prompt for error messages
2. Look at the [GitHub Issues](https://github.com/JamieWonderchild/LuminaFaith/issues) page
3. Create a new issue with:
   - Your operating system
   - The exact error message
   - What you were trying to do when the error occurred
4. Contact Jamie directly for environment-related issues

---

## Next Steps

### Once Everything is Running

1. **Explore the Code**:
   - Look at the `src/` folder to understand the project structure
   - Check out the components in `src/components/`
   - Look at the screens in `src/screens/`

2. **Make Your First Change**:
   - Try changing some text in `src/screens/HomeScreen.tsx`
   - Save the file and see it update on your phone automatically

3. **Run Tests**:
   ```bash
   npm test
   ```

4. **Check Code Quality**:
   ```bash
   npm run lint
   npm run type-check
   ```

### Development Workflow

1. **Make changes** to the code
2. **See changes** automatically on your phone (hot reload)
3. **Test your changes**: `npm test`
4. **Commit your changes**: 
   ```bash
   git add .
   git commit -m "Describe what you changed"
   ```
5. **Push to GitHub** (if you have push access):
   ```bash
   git push origin master
   ```

### Working with the Shared Environment

**Important Guidelines**:
- You're sharing the database with other developers
- Be careful when testing - don't create too much test data
- Use test emails like `test1@example.com`, `test2@example.com`, etc.
- Don't delete or modify data created by others
- If you need to test destructive operations, coordinate with Jamie first

### Building for Production

When you're ready to share your app:
1. **Create an Expo account** if you haven't already
2. **Build the app**:
   ```bash
   expo build:android
   expo build:ios
   ```
3. **Deploy to app stores** (requires developer accounts)

---

## 🎉 Congratulations!

You now have LuminaFaith running on your development machine! You can:
- ✅ Make changes to the code
- ✅ See them instantly on your phone
- ✅ Test the app thoroughly
- ✅ Commit your changes to GitHub
- ✅ Work with the shared development environment

### Key Commands to Remember

```bash
# Start development server
npm start

# Run tests
npm test

# Check code quality
npm run lint

# Check TypeScript
npm run type-check

# Clear cache if issues
npx expo start --clear

# Install new dependencies
npm install package-name
```

### Files You'll Need from Jamie

1. **`.env`** - Environment configuration file with database credentials
2. **Database access** - You'll be using the shared Supabase instance
3. **Any additional configuration files** if needed

**Happy coding! 🚀**

---

*This guide was created to help you get started with LuminaFaith development using the shared environment. If you find any issues or have suggestions for improvement, please create an issue on GitHub or contact Jamie directly.*