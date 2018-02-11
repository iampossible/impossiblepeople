FROM node:latest

# Create app directory
RUN mkdir -p /src/web
WORKDIR /src/web

# Install app dependencies
COPY package.json /src/web/
RUN npm install

# Bundle app source
COPY . /src/web

# Build and optimize react app
# RUN npm run build

EXPOSE 3001

# defined in package.json
CMD [ "npm", "start" ]
