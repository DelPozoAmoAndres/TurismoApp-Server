# Use an official Node.js runtime as a parent image
FROM node:18

# Create and set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application source code to the working directory
COPY . .

# Build TypeScript code into JavaScript (you should have a tsconfig.json in your project)
RUN npm run build

# Expose the port your application will run on
EXPOSE 3000

# Define the command to run your application
CMD [ "node", "dist/api/server.js" ]
