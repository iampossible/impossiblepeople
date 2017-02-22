import { ionicBootstrap, Nav, Platform, Events, AlertController } from 'ionic-angular'
import { enableProdMode, provide, Component, ViewChild } from '@angular/core'
import { RequestOptions, XHRBackend } from '@angular/http'
import { Routes } from '@angular/router'
import {
  AuthService,
  FeedService,
  ImageService,
  InterestService,
  PostService,
  ProfileService,
  UserService
} from './services/api/ApiService'
import { AuthPage, InterestsPage, LandingPage, MainPage, PostDetailPage, ProfilePage, SignUpPage } from './pages/Pages'
import { CreatePostTab } from './pages/MainPage/Tabs'
import { EditProfileModal } from './pages/ProfilePage/SettingsPage/EditProfileModal/EditProfileModal'
import { FacebookService } from './services/api/FacebookService'
import { QuickFeedback } from './components/QuickFeedback/QuickFeedback'
import { Environment } from './Environment'
import { InterceptedHttp } from './services/api/InterceptedHttp'
import { NotificationService } from './services/NotificationService'
import Timer = NodeJS.Timer

if (Environment.ENV === 'prod') {
  enableProdMode()
}

declare const cordova: any
declare const heap: any
declare const window: any

@Component({
  selector: 'ion-app',
  template: '<ion-nav [root]="rootPage"></ion-nav><quick-feedback id="feedback"></quick-feedback>',
  directives: [QuickFeedback]
})
@Routes([
  { path: '/', component: LandingPage },
  { path: '/user/auth', component: AuthPage },
  { path: '/user/create', component: SignUpPage },
  { path: '/user/interests', component: InterestsPage },
  { path: '/home', component: MainPage },
  { path: '/post/create', component: CreatePostTab },
  { path: '/post/:postID', component: PostDetailPage },
  { path: '/profile/:userID', component: ProfilePage },
  { path: '/user/profile/edit', component: EditProfileModal },
])
export class IonicApp {
  @ViewChild(Nav) nav: Nav
  rootPage: any

  constructor(private platform: Platform,
    private events: Events,
    private userService: UserService,
    private notificationService: NotificationService,
    private alertCtrl: AlertController) {
    platform.ready().then(() => this.onReady())

    if (localStorage.getItem('USER_ID')) {
      platform.ready().then(this.notificationService.setupOnLaunch.bind(this.notificationService))
      if (Environment.HEAP && 'heap' in window) {
        let interval: Timer = setInterval(() => {
          if (heap.hasOwnProperty('identify')) {
            heap.identify(localStorage.getItem('USER_ID'))
            heap.track('SESSION_START')
            clearTimeout(interval)
          }
        }, 100)

        setTimeout(() => {
          clearTimeout(interval)
        }, 5000)
      }
      this.rootPage = MainPage
    } else {
      this.rootPage = LandingPage
    }
  }

  onReady() {
    try {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false)
    } catch (ex) {
      console.warn('Could not set show accessory bar property')
    }

    try {
      cordova.plugins.certificates.trustUnsecureCerts(true)
    } catch (ex) {
      console.warn('Could not set trustUnsecureCerts')
    }

    if (Environment.HEAP && 'heap' in window) {
      heap.load(Environment.HEAP)
    }

    //non production init
    if (Environment.ENV !== 'prod') {
      window.testing = {
        trigger: (event, data) => {
          this.events.publish(event, data);
        },
      }
      console.log('cocked, locked and ready to rock')
    }

  }

  ngAfterViewInit() {
    this.events.subscribe('unauthorised', () => {
      localStorage.removeItem('USER_ID')
      this.notificationService.unregister()
      setTimeout(() => {
        window.location.href = window.location.href.split('#').shift();
      }, 333);
    })

    this.events.subscribe('notifications:receive', (args) => {
      console.info('Notification received', JSON.stringify(args))
      let data = args[0].additionalData

      if (data.foreground) { // Notification received while app is open

      } else { // Notification received while app closed
        if (data.hasOwnProperty('postID')) {
          this.nav.push(PostDetailPage, { postID: data.postID })
        }

        if (data.hasOwnProperty('userID')) {
          this.nav.push(ProfilePage, { userID: data.userID })
        }

      }
    })

    this.events.subscribe('notifications:register', (args) => {
      let data = args[0]
      this.userService.registerNotifications(data.registrationId).subscribe(() => {
        console.info('Registered device ' + data.registrationId)
      }, (err) => {
        console.warn('Could not register device endpoint', JSON.stringify(err))
      })
    })

    this.events.subscribe('notifications:activate', () => {
      this.notificationService.register()
    })

    this.events.subscribe('connection:noconnection'), () => {
      let failAlert = this.alertCtrl.create({
        title: 'Oops!',
        subTitle: 'You seem to have lost your internet connection',
        buttons: ['OK']
      })
      failAlert.present()
    }
  }
}

ionicBootstrap(IonicApp, [
  AuthService,
  FeedService,
  ImageService,
  InterestService,
  NotificationService,
  PostService,
  UserService,
  ProfileService,
  FacebookService,
  provide(InterceptedHttp, {
    useFactory: (backend: XHRBackend, opts: RequestOptions, events: Events) => {
      return new InterceptedHttp(backend, opts, events)
    },
    deps: [XHRBackend, RequestOptions, Events]
  })])
