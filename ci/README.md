# Continuous Integration - Human kind 


The current workflow is:

1- GitHub commit to master
2- CircleCI builds Docker images (API and Web)
3- Images are uploaded to Docker Hub ( https://hub.docker.com/r/codeyourfuture/humankind-api/ and https://hub.docker.com/r/codeyourfuture/humankind-web) 
4- CircleCI runs `deploy.sh` and the ECS tasks are updated with the new images.


In this directory you'll find:

```
├── cloudformation
│   ├── humankind-cert.json
│   ├── humankind-db.json
│   ├── humankind-dns.json
│   └── README.md
├── deploy.sh
└── README.md
```

## Cloudformation 

Contains some json files used to create the initial infrastructure


## deploy.sh

This is the script used by CircleCI to update the container images on ECS.


## Check the deployed version

https://humankind.codeyourfuture.io/version.txt


## To Do

- Avoid building and deployment when no code was changed (ex.: no need to build `web` if only `api` was changed)
