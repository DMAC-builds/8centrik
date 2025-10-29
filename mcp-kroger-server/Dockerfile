# Use the official Node.js image (upgraded to Node 20 for better Supabase support)
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Install build dependencies and curl for health checks
RUN apk add --no-cache python3 make g++ curl

# Copy package files first (for better Docker layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy the rest of the application code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S mcpserver -u 1001

# Change ownership of the app directory
RUN chown -R mcpserver:nodejs /app
USER mcpserver

# Expose the port the app runs on
EXPOSE 3001

# Command to run the application in development mode
CMD [ "npm", "run", "dev" ]

