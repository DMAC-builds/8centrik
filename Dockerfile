# Use the official Node.js image (upgraded to Node 20 for better Supabase support)
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Install git, curl, and other build dependencies
RUN apk add --no-cache git python3 make g++ curl

# Copy package files first (for better Docker layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps --only=production=false

# Copy source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port 3000
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]
