#DEPRECATED - use [the new app](https://github.com/iampossible/impossiblepeople/blob/master/app)
# gnome-app mobile client

We used ionic 2 for implementing a hybrid mobile client for the gnome-app. 

## Build locally
If you would like to run, and develop the app locally, the following steps are necessary:

1. Install neo4j. Either use a binary, or brew install neo4j. Make sure the version i >= 3.0.0.
    1. Make sure the environment variable NEO4J_AUTH  is not on your current shell. If it is set, change the neo4j password to match it.
    2. Go to `localhost:7474` and run :server-connect to set the password to neo4j. In order to do so, set it to something different first and change it back to neo4j.
       The [DataHelper](https://github.com/iampossible/impossiblepeople/blob/master/api/test/DataHelper.js) will access the database.
2. Install rabbitmq-server

### Development commands
* Run `gulp webserver` to run the app on port 8090.
* Run `gulp e2e` to run end-to-end tests. Make sure you have an api up and running.
* Run `gulp test` to run the unit tests
* Run `gulp build` to build the app. To build it for stage run `GNOME_ENV=stage gulp build`, use `GNOME_ENV=prod gulp build` to build for production.

## Build for phone
1. To build the application for staging: `GNOME_ENV=stage ionic build ios`
1. To build the application for app store: `GNOME_ENV=prod ionic build ios`

## Resources
angular 2 and ionic 2 are still in development and their source code as well as their dependencies are in flux.
The following repositories have been proven helpful to track changes:

* [angular 2 change log](https://github.com/angular/angular/blob/master/CHANGELOG.md)
* [ionic 2 change log](https://github.com/driftyco/ionic/blob/2.0/CHANGELOG.md)
