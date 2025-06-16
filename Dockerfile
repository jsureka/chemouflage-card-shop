FROM node:22 AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install dependencies
RUN rm -rf package-lock.json 2>/dev/null || true
RUN npm install

# Copy source code and environment files
COPY . .
COPY .env.production .env

# Build the application
RUN npm run build

FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]