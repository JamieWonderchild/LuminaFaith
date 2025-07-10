# 🙏 LuminaFaith - Simple Docker Setup Guide

*Get LuminaFaith running on your computer in 5 minutes using Docker!*

## 🚀 Why Docker?

Docker eliminates the need to install Node.js, npm, Expo CLI, and manage dependencies. Everything runs in a container, so it works the same on Windows, Mac, and Linux.

## 📋 What You Need

1. **Docker** (only requirement!)
2. **Your phone** with Expo Go app
3. **Environment file** from Jamie

---

## Step 1: Install Docker

### Windows
1. Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. Run the installer
3. Start Docker Desktop
4. Wait for it to say "Docker Desktop is running"

### Mac
1. Download [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
2. Drag Docker to Applications folder
3. Start Docker Desktop
4. Wait for it to say "Docker Desktop is running"

### Linux
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
sudo usermod -aG docker $USER
# Log out and log back in
```

### Verify Docker Installation
```bash
docker --version
docker-compose --version
```

---

## Step 2: Get the Project

1. **Clone the repository**:
   ```bash
   git clone https://github.com/JamieWonderchild/LuminaFaith.git
   cd LuminaFaith
   ```

2. **Get the environment file**:
   - Contact Jamie for the `.env` file
   - Place it in the LuminaFaith folder (same level as `docker-compose.yml`)

---

## Step 3: Install Expo Go on Your Phone

### iPhone
1. Open App Store
2. Search "Expo Go"
3. Install the app

### Android
1. Open Google Play Store
2. Search "Expo Go"
3. Install the app

---

## Step 4: Run the App

1. **Start the development server**:
   ```bash
   docker-compose up
   ```

2. **Wait for it to build** (first time takes 3-5 minutes)

3. **Look for the QR code** in your terminal - it will look like this:
   ```
   █▄▄▄▄▄▄▄█▄██▄▄▄█▄▄▄█▄▄███▄█
   
   › Metro waiting on exp://0.0.0.0:8081
   › Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
   ```

4. **Scan the QR code**:
   - **iPhone**: Use Camera app
   - **Android**: Use "Scan QR Code" in Expo Go

5. **The app loads on your phone!** 🎉

> **Note**: The first time you run this, Docker will download and build everything. Subsequent runs are much faster (30 seconds).

---

## 🔧 Common Commands

```bash
# Start the app
docker-compose up

# Start in background
docker-compose up -d

# Stop the app
docker-compose down

# View logs
docker-compose logs -f

# Restart after changes
docker-compose restart

# Clear cache and restart
docker-compose down
docker-compose up --build
```

---

## 🐛 Troubleshooting

### "Docker is not running"
- Start Docker Desktop
- Wait for it to say "Docker Desktop is running"

### "Permission denied" (Linux)
```bash
sudo usermod -aG docker $USER
# Log out and log back in
```

### "Port already in use"
```bash
docker-compose down
docker-compose up
```

### "Can't connect to Metro"
- Make sure your phone and computer are on the same WiFi
- Try restarting: `docker-compose restart`

### "No QR code showing"
- Check the logs: `docker-compose logs -f`
- Look for the QR code in the terminal output

### "App won't load on phone"
- Check if Docker container is running: `docker ps`
- Restart the container: `docker-compose restart`
- Try using "Tunnel" mode in Expo Go

---

## 🎯 Making Changes

1. **Edit code** in your favorite editor
2. **Save the file**
3. **Changes appear automatically** on your phone (hot reload)

### Running Tests
```bash
# Run tests in the container
docker-compose exec luminafaith-dev npm test

# Run linting
docker-compose exec luminafaith-dev npm run lint
```

---

## 📱 Development Workflow

1. **Start Docker**: `docker-compose up`
2. **Make changes** to the code
3. **See changes** instantly on your phone
4. **Commit changes**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin master
   ```
5. **Stop Docker**: `docker-compose down`

---

## 🎉 That's It!

You now have LuminaFaith running with Docker! No need to install Node.js, npm, or manage dependencies. Everything is containerized and works the same on all computers.

### What You Can Do Now:
- ✅ Edit code and see changes instantly
- ✅ Test on your phone
- ✅ Run tests and linting
- ✅ Commit to GitHub
- ✅ Share with others easily

### Key Benefits of Docker Setup:
- **No complex installation** - just Docker
- **Works on all operating systems** - Windows, Mac, Linux
- **Consistent environment** - same for everyone
- **Easy to share** - just share the repo
- **No dependency conflicts** - everything is isolated

---

## 🆘 Getting Help

If you have issues:
1. Check the troubleshooting section above
2. Look at the Docker logs: `docker-compose logs -f`
3. Contact Jamie with:
   - Your operating system
   - The exact error message
   - Output of `docker ps` and `docker-compose logs`

**Happy coding! 🚀**