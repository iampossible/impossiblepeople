import { Component, enableProdMode } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LandingPage } from '../pages/landing/landing';
import { TabsPage } from '../pages/tabs/tabs';
import { NotificationService } from '../providers/notification-service/notification-service';
import { Environment } from '../Environment';

if (Environment.ENV === 'prod') {
  enableProdMode();
}

declare const cordova: any;
declare const heap: any;
declare const window: any;

type RootPage = LandingPage | TabsPage;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = LandingPage;

  constructor(platform: Platform,
    private events: Events,
    notificationService: NotificationService,
    statusBar: StatusBar,
    splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();


      try {
        cordova.plugins.certificates.trustUnsecureCerts(true);
      } catch (ex) {
        console.warn('Could not set trustUnsecureCerts');
      }

      if (Environment.HEAP && 'heap' in window) {
        heap.load(Environment.HEAP);
      }

      // non production init
      if (Environment.ENV !== 'prod') {
        window.testing = {
          trigger: (event, data) => {
            this.events.publish(event, data);
          },
        };
        console.log('cocked, locked and ready to rock');
      }


      if (localStorage.getItem('USER_ID')) {
        notificationService.setupOnLaunch();
        if (Environment.HEAP && 'heap' in window) {
          let interval = setInterval(() => {
            if (heap.hasOwnProperty('identify')) {
              heap.identify(localStorage.getItem('USER_ID'));
              heap.track('SESSION_START');
              clearTimeout(interval);
            }
          }, 100);

          setTimeout(() => {
            clearTimeout(interval);
          }, 5000);
        }
        this.rootPage = TabsPage;
      } else {
        this.rootPage = LandingPage;
      }

    });
  }
}
