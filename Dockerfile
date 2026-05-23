
# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install backend dependencies
RUN npm install

# Copy backend source
COPY backend/ ./backend

# Copy frontend source
COPY frontend/ ./frontendsources

# Install frontend dependencies
RUN npm --prefix frontendsources install

# Build frontend
RUN npm --prefix frontendsources run build

# Create frontend folder
# RUN mkdir frontend

# # Copy built frontend files
# RUN cp -r ./frontendsources/dist ./frontend
RUN mkdir -p backend/frontend
RUN cp -r ./frontendsources/dist ./backend/frontend

# Remove temporary frontend source folder
RUN rm -rf ./frontendsources

# Expose backend port
EXPOSE 8000

# Start server
CMD ["npm", "start"]