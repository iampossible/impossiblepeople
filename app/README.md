# gnome-app mobile client

## How to use this template

This app is built using [Ionic](http://ionicframework.com/docs/) and is a frontend fed by the ImpossiblePeople server.

### Building/Running the app:

To set up the target platform

```bash
$ ionic cordova platform add ios
```

or 

```bash
$ ionic cordova platform add android
```

To build a production app, edit [src/Environment.ts]() to input your server configurations and


```bash
$ ionic cordova platform build ios --prod
```

or


```bash
$ ionic cordova platform build android --release --prod
```

To develop use the `ionic cordova run` [more info here](http://ionicframework.com/docs/intro/deploying/)  or `ionic serve` [more info here](http://ionicframework.com/getting-started)