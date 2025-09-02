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
ENV VITE_API_URL=https://alttill-be-dev.az-sterlingapp-tcoe-dev.p.azurewebsites.net
ENV VITE_PERSONAL_WITHDRAWAL_LIMIT=500000
ENV VITE_INDIVIDUAL_CURRENT_WITHDRAWAL_LIMIT=500000
ENV VITE_CORPORATE_CURRENT_WITHDRAWAL_LIMIT=3000000
ENV VITE_TRANSACTION_LIMIT=10000000
ENV VITE_SECRETKEY=Swe4g7c?UBm5Nrd96vhsVDtkyJFbqKMTm!TMw5BDRLtaCFAXNvbq?s4rGKQSZnUP

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