# Use Node.js 22 as the base image
FROM node:22-alpine

# Set the working directory for the app
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the application code
COPY . .

# Build the Vite app for production
RUN npm run build

# Expose the port for the Vite preview server
EXPOSE 4173

# Start the Vite preview server
CMD ["npm", "run", "preview"]