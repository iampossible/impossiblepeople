# Developer information

## Installation instructions

The following instructions will get you up and running with the gnome-app.

_Note, the instructions have only been tested on OSX._ 

### Installing dependencies
* Install [docker toolbox](https://www.docker.com/products/docker-toolbox)
    * Create a docker machine named default: `docker-machine create --driver virtualbox default`
    * Print docker environment variables and source them: `eval $(docker-machine env)`
    * Give docker VM enough memory, we use 4096MB. In order to do so, you need to stop the docker VM `docker-machine stop default`.
* Install [node](https://nodejs.org/en/download/) or run `brew install node` if you have brew installed.
* Install cordova globally: `npm install -g cordova`
    * __note:__ on OSX cordova  might need needs [special permissions on ~/.config folder](http://stackoverflow.com/questions/34058245/ionic-2-an-error-occurred-trying-to-fall-back-to-cordova-lib-execution-typeer)
* Install dependencies
    * Navigate to the api directory and run `npm install`
    * Navigate to the ionic-app directory and run `npm install`
* Go to the ionic-app directory and:
    * Run `ionic state reset` to install platforms and cordova plugins.
    * Run `ionic resources` to build splash screen, app icon etc.

**Nice one**! At this point you have all the dependencies installed and you are ready to [rock](https://www.youtube.com/watch?v=dK_zQYT5WAY).

### Environment variables
The environment variables need to be set for various tools and integrations. Do the following:

1. Rename environment.example to environment `cp environment.example environment`
2. If you are a core contributor, talk to Jonathan. Otherwise, add your environment variables in `environment`.

The most important variable is NEO4J_AUTH - you must setting it before you continue. The username you cannot change, but feel free to update the password.
```
NEO4J_AUTH=neo4j/somepassword
```

Make sure you export them to the current shell `export NEO4J_AUTH=neo4j/something`.

### Development commands
We are using docker to run neo4j, rabbitmq, and our applications. This means you won't have to
install any dependencies apart from docker.

**At this point, it is time to [tune into this song](https://youtu.be/7qbEt_lSib4) and run the below commands.
Feel free to sing along to the chorus while your shell happily runs the commands. Commands need to be run from project root.**

#### Api commands:
* Build a new container including the latest source and dist files: `npm run api:build`
* Run api tests: `npm run api:test`. If tests fail at this point, it is likely that some of the environment variables are incorrect.
* Run the api on port 3000: `npm run api:run`. If you head over to `http://docker-machine-ip:3000` you will see the api up and running.
  In order to obtain the docker-machine-ip, run `docker env` and peak on DOCKER_HOST.

The first times you run the above commands, they might take longer than

#### App commands:
* Build a container, containing the application: `npm run app:build`
* Wipe container state: `npm run app:clean`
* Run app unit tests: `npm run app:test`
* Run app e2e tests: `npm run app:e2e`

### General advice
* To manage container we use `docker-machine` or Kinematic (comes with the Docker toolbox).
* If you have any questions, feel free to [reach out](mailto:filipe@impossible.com).
