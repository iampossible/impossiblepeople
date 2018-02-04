# Continuous Integration - Human kind 


The current workflow is:

GitHub -> CircleCI builds Docker images (API and Web) -> Images are uploaded to Docker Hub ( https://hub.docker.com/r/codeyourfuture/humankind-api/ and https://hub.docker.com/r/codeyourfuture/humankind-web) -> CircleCI runs `deploy.sh` and the ECS tasks are updated with the new images.


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


## To Do

- Avoid building and deployment when no code was changed (ex.: no need to build `web` if only `api` was changed)
