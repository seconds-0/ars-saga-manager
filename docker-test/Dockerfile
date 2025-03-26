FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Create directories for mounting source code
RUN mkdir -p /usr/src/app/frontend
RUN mkdir -p /usr/src/app/backend
RUN mkdir -p /usr/src/app/test-results

# Copy package.json files to leverage Docker caching
COPY ./package*.json ./
COPY ./frontend/package*.json ./frontend/
COPY ./backend/package*.json ./backend/

# Install root dependencies
RUN npm install

# Install frontend and backend dependencies
WORKDIR /usr/src/app/frontend
RUN npm install

WORKDIR /usr/src/app/backend
RUN npm install

# Return to the app root
WORKDIR /usr/src/app

# Copy test configuration
COPY ./frontend/testing/ ./frontend/testing/
COPY ./scripts/ ./scripts/

# Install Jest globally for easier access
RUN npm install -g jest

# Set environment variables
ENV NODE_ENV=test
ENV CI=true
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Use script as entrypoint
COPY ./docker-test/run-tests.sh /usr/src/app/
RUN chmod +x /usr/src/app/run-tests.sh

ENTRYPOINT ["/usr/src/app/run-tests.sh"]