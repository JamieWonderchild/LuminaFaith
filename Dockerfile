# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install global dependencies
RUN npm install -g @expo/cli

# Copy package files
COPY package*.json ./

# Install project dependencies
RUN npm install --legacy-peer-deps

# Copy project files
COPY . .

# Expose ports for Expo dev server
EXPOSE 19000 19001 19002

# Set environment variables for Expo
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

# Start the development server
CMD ["npm", "start"]