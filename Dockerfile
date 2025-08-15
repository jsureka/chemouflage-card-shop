# Multi-stage Dockerfile for frontend

# Base stage installs dependencies
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Development stage runs Vite dev server
FROM base AS development
ENV NODE_ENV=development
EXPOSE 8080
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage for production assets
FROM base AS build
COPY .env.production .env
RUN npm run build

# Production stage serves built assets with Nginx
FROM nginx:1.25-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
