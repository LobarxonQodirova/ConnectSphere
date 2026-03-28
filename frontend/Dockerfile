FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --silent

COPY . .
RUN npm run build

# The build output is in /app/build and will be served by nginx
FROM alpine:3.19
COPY --from=build /app/build /app/build
