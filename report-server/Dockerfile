FROM alpine

ENV NEO4J_HOST 'http://neo4j:7474'
#ENV GNOME_REPORTS_PWD '/root'

# Setup queues
RUN mkdir -p /root/reports/failed && mkdir -p /root/reports/unprocessed

COPY ./package.json .
RUN apk --no-cache --update add nodejs nodejs-npm \
  && npm config set loglevel warn \
  && npm --quiet install \
  && npm cache clean

RUN node -v

# Add crontab file in the cron directory
COPY crontab report.crontab
RUN crontab report.crontab

COPY templates /root/templates
COPY src /root/src

ENTRYPOINT ["crond", "-f"]

#ENTRYPOINT node /root/src/getUsers.js && node /root/src/processReport.js