#!/bin/bash

echo "Deploying.."

usage() {
    echo "Usage: $0 --cluster CLUSTER_NAME --service SERVICE_NAME --task TASK_NAME DOCKER_IMAGE"
    exit 1
}

while true ; do
    case "$1" in
        -t|--task) TASK_NAME=$2 ; shift 2 ;;
        -s|--service) SERVICE_NAME=$2 ; shift 2 ;;
        -c|--cluster) CLUSTER_NAME=$2 ; shift 2 ;;
        -h|--help) usage ;;
        --) shift ; break ;;
        *) break ;;
    esac
done

[ $# -eq 0 -o -z "$TASK_NAME" -o -z "$SERVICE_NAME" -o -z "$CLUSTER_NAME" ] && usage

aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
aws configure set default.region $AWS_REGION

## docker.io/codeyourfuture/humankind-api:d6f3d61
DOCKER_IMAGE="$1"

expr='.serviceArns[]|select(contains("/'$SERVICE_NAME'"))|split("/")|.[1]'
SNAME=$(aws ecs list-services --output json --cluster $CLUSTER_NAME | jq -r $expr)

OLD_TASK_DEF=$(aws ecs describe-task-definition --task-definition $TASK_NAME --output json)
NEW_TASK_DEF=$(echo $OLD_TASK_DEF | jq --arg NDI $DOCKER_IMAGE '.taskDefinition.containerDefinitions[0].image=$NDI')
FINAL_TASK=$(echo $NEW_TASK_DEF | jq '.taskDefinition|{family: .family, volumes: .volumes, containerDefinitions: .containerDefinitions}')

aws ecs register-task-definition --family $TASK_NAME --cli-input-json "$(echo $FINAL_TASK)" > /dev/null
aws ecs update-service --service $SNAME --task-definition $TASK_NAME --cluster $CLUSTER_NAME > /dev/null
