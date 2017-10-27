import { Component, enableProdMode } from '@angular/core';
import { Platform, Events, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LandingPage } from '../pages/landing/landing';
import { TabsPage } from '../pages/tabs/tabs';
import { PostDetailsPage } from '../pages/post-details/post-details';
import { ProfilePage } from '../pages/profile/profile';
import { NotificationService } from '../providers/notification-service/notification-service';
import { UserService } from '../providers/user-service/user-service';
import { Environment } from '../Environment';
import { RegistrationEventResponse, NotificationEventResponse } from '@ionic-native/push';

if (Environment.ENV === 'prod') {
  enableProdMode();
}

declare const cordova: any;
declare const heap: any;
declare const window: any;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;

  constructor(platform: Platform,
    private alertCtrl: AlertController,
    private events: Events,
    private notificationService: NotificationService,
    private userService: UserService,
    statusBar: StatusBar,
    splashScreen: SplashScreen) {

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      // statusBar.styleBlackTranslucent();
      splashScreen.hide();

      try {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      } catch (ex) {
        console.warn('Could not set show accessory bar property');
      }

      try {
        cordova.plugins.certificates.trustUnsecureCerts(true);
      } catch (ex) {
        console.warn('Could not set trustUnsecureCerts', ex);
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

  ngAfterViewInit() {
    this.events.subscribe('unauthorised', () => {
      localStorage.removeItem('USER_ID');
      this.notificationService.unregister();
      setTimeout(() => {
        window.location.href = window.location.href.split('#').shift();
      }, 333);
    });

    this.events.subscribe('notifications:receive', (e: NotificationEventResponse) => {
      console.info('Notification received', JSON.stringify(e));
      let data = e.additionalData;

      if (data.foreground) { // Notification received while app is open

      } else { // Notification received while app closed
        if (data.hasOwnProperty('postID')) {
          this.rootPage.getActiveNav().push(PostDetailsPage, { postID: data.postID });
        }

        if (data.hasOwnProperty('userID')) {
          this.rootPage.getActiveNav().push(ProfilePage, { userID: data.userID });
        }

      }
    });

    this.events.subscribe('notifications:register', (data: RegistrationEventResponse) => {
      console.log('notifications:register', data);
      this.userService.registerNotifications(data.registrationId).subscribe(() => {
        console.info('Registered device ' + data.registrationId);
      }, (err) => {
        console.warn('Could not register device endpoint', JSON.stringify(err));
      });
    });

    this.events.subscribe('notifications:activate', () => {
      this.notificationService.register();
    });

    this.events.subscribe('connection:noconnection'), () => {
      let failAlert = this.alertCtrl.create({
        title: 'Oops!',
        subTitle: 'You seem to have lost your internet connection',
        buttons: ['OK']
      });
      failAlert.present();
    };
  }

}
