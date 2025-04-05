# Use the official nginx image as the base
FROM nginx:latest

# Copy the static files from your web project to the nginx html folder
COPY . /usr/share/nginx/html

# Expose port 80 for the web server
EXPOSE 80
