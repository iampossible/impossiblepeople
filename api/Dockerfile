FROM node:argon-alpine

MAINTAINER Jonathan Tavares <jonathan@impossible.com>

COPY ./package.json /usr/src/api/package.json
WORKDIR /usr/src/api
RUN apk --no-cache --update add --virtual build-dependencies build-base python \
  && apk --update add curl \
  && npm config set loglevel warn \
  && npm --quiet install \
  && npm cache clean \
  && apk del build-dependencies

ENV NODE_PATH src

ENV GNOME_HOST 0.0.0.0
ENV GNOME_PORT 3000
ENV GNOME_LOG 1
ENV SQS_HOST 'http://sqs:4568/'
ENV NEO4J_HOST 'http://neo4j:7474'

COPY . /usr/src/api

EXPOSE $GNOME_PORT

CMD [ "npm", "start" ]
