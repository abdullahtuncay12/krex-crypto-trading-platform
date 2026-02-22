FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build frontend with API URL
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build --workspace=frontend

# Install serve to run the preview
RUN npm install -g serve

WORKDIR /app/frontend

EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]
