FROM node:argon

MAINTAINER Jonathan Tavares <jonathan@impossible.com>


RUN apt-get update && \
    apt-get install -y xvfb chromium

ADD xvfb-chromium /usr/bin/xvfb-chromium

RUN ln -s /usr/bin/xvfb-chromium /usr/bin/google-chrome && \
    ln -s /usr/bin/xvfb-chromium /usr/bin/chromium-browser

# Startup and shutdown chrome to set up an initial user-data-dir
RUN google-chrome --user-data-dir=/root/chrome-user-data-dir & \
    (sleep 5 && kill $(pgrep -o chromium) && sleep 2)

ENV CHROME_BIN /usr/bin/google-chrome

COPY ./package.json /usr/src/ionic-app/package.json
WORKDIR /usr/src/ionic-app

RUN npm config set loglevel warn
RUN npm install --quiet
RUN npm install --quiet -g gulp-cli
RUN npm install --quiet -g typings
RUN node ./node_modules/protractor/bin/webdriver-manager update

COPY ./typings.json /usr/src/ionic-app/typings.json
RUN typings install

COPY ./config /usr/src/ionic-app/config
COPY ./*.* /usr/src/ionic-app/
COPY ./src /usr/src/ionic-app/src
COPY ./script /usr/src/ionic-app/script
COPY ./www /usr/src/ionic-app/www

ENV APP_PORT 8090
ENV APP_HOST 0.0.0.0

ENV NEO4J_HOST 'http://neo4j:7474'
ENV E2E_CLIENT 'http://client:'
ENV E2E_SELENIUM_HOST='http://selenium:4444/wd/hub'
ENV E2E_PORT=5555

EXPOSE $APP_PORT
EXPOSE $E2E_PORT

CMD gulp e2e
