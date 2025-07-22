FROM node:22-alpine

#  Install system dependencies
RUN apk add --no-cache ffmpeg

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Expose port
EXPOSE 5050

# Start command
CMD ["npm", "run", "dev"]