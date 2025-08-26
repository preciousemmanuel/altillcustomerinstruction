# Stage 1: Build the React app
FROM node:20-alpine AS build-stage

# Set the working directory
WORKDIR /app

# Copy the package.json and yarn.lock (if available)
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application code
COPY . .

# Add env variable

# Build the application
RUN yarn run build

# Stage 2: Serve the React app with nginx
FROM nginx:alpine

# Copy the built files from the previous stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy the custom nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port on which nginx will run
EXPOSE 80

# No need to specify CMD as nginx image already has the default command to run nginx