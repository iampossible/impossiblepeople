import { Component, enableProdMode, ViewChild } from '@angular/core';
import { Platform, Events, NavController, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LandingPage } from '../pages/landing/landing';
import { TabsPage } from '../pages/tabs/tabs';
import { NotificationService } from '../providers/notification-service/notification-service';
import { UserService } from '../providers/user-service/user-service';
import { Environment } from '../Environment';
import { PostDetailPage } from '../pages/post-detail/post-detail';
import { ProfilePage } from '../pages/profile/profile';

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
  @ViewChild('myNav') nav: NavController;
  rootPage: any = LandingPage;

  constructor(platform: Platform,
    private alertCtrl: AlertController,
    private events: Events,
    private notificationService: NotificationService,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    private userService: UserService) {

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

  ngOnInit() {
    this.events.subscribe('unauthorised', () => {
      localStorage.removeItem('USER_ID');
      this.notificationService.unregister();
      this.nav.popToRoot();
    });

    this.events.subscribe('notifications:receive', (args) => {
      console.info('Notification received', JSON.stringify(args));
      let data = args[0].additionalData;

      if (data.foreground) { // Notification received while app is open

      } else { // Notification received while app closed
        if (data.hasOwnProperty('postID')) {
          this.nav.push(PostDetailPage, { postID: data.postID });
        }

        if (data.hasOwnProperty('userID')) {
          this.nav.push(ProfilePage, { userID: data.userID });
        }

      }
    });

    this.events.subscribe('notifications:register', (args) => {
      let data = args[0];
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
