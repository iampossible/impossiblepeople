#!/bin/bash -eu

echo 'Resetting queues...'
curl -X DELETE ${SQS_HOST}
curl ${SQS_HOST} -d "Action=CreateQueue&QueueName=gnome-test-dev"
curl ${SQS_HOST} -d "Action=CreateQueue&QueueName=gnome-activity-dev"
curl ${SQS_HOST} -d "Action=CreateQueue&QueueName=gnome-notification-dev"
curl ${SQS_HOST} -d "Action=CreateQueue&QueueName=gnome-email-dev"

password="${NEO4J_AUTH#neo4j/}"
echo "Waiting for neo4j...."
echo ${NEO4J_HOST:=http://localhost:7474}
while true; do
    curl -X GET ${NEO4J_HOST}/db/data/ --user "neo4j:${password}"
    if [ $? -eq 0 ]; then
        echo CURL_SUCCEEDED
        break
    fi
    sleep 1s
done

