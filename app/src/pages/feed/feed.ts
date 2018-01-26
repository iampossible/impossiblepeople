import { Component } from '@angular/core';
import { NavController, NavParams, Events, AlertController, Tabs, Platform, ModalController, Alert } from 'ionic-angular';
import { Response } from '@angular/http';
import { Network } from '@ionic-native/network';

import { FeedService } from '../../providers/feed-service/feed-service';
import { UserService } from '../../providers/user-service/user-service';
import { Subscription } from 'rxjs/Subscription';
import { FacebookService } from '../../providers/facebook-service/facebook-service';
import { SelectContactsModalPage } from '../select-contacts-modal/select-contacts-modal';
import { AuthService } from '../../providers/auth-service/auth-service';
import { Environment } from '../../Environment';
// import { ScrollTopProvider } from '../../providers/scroll-top/scroll-top';

declare const heap: any;

// @IonicPage()
@Component({
  selector: 'page-feed',
  templateUrl: 'feed.html',
})
export class FeedPage {

  public isScrolling: Boolean = false;
  public isAndroid: Boolean = false;
  public isOnline: Boolean = true;
  private disconnectSubscription: Subscription;
  public loadingLocation: Boolean = false;
  public scrollElement: Element;
  public feed: Array<Object> = [];
  public showIntro: Boolean = false;
  public showBanner: Boolean = false;
  private isDay;
  private introSeen;
  private topBannerSeen;
  private user: any = {
    interests: [],
    posts: [],
  };
  alreadyLinked: Alert;

  constructor(private feedService: FeedService,
    private events: Events,
    private userService: UserService,
    private alertCtrl: AlertController,
    private nav: NavController,
    public navParams: NavParams,
    public platform: Platform,
    private network: Network,
    private facebookService: FacebookService,
    private modalCtrl: ModalController,
    private authService: AuthService) {

    this.isAndroid = platform.is('android');

    this.alreadyLinked = this.alertCtrl.create({
      title: 'Account already linked',
      subTitle: 'Another user is already linked to that Facebook account. Please double-check your Facebook credentials.',
      buttons: ['OK'],
    });

    this.events.subscribe('user:updated', () => {
      this.getFeed();
      this.isScrolling = false;
    });

    this.events.subscribe('user:posts:updated', () => {
      this.getFeed();
      this.isScrolling = false;
    });

    this.events.subscribe('user:updated', () => {
      this.getFeed();
      this.isScrolling = false;
    });

    this.events.subscribe('CreatePostTab:close', () => {
      this.getFeed();
      this.dismissIntroScreen();
      this.ionViewWillLeave();
      this.ionViewWillEnter();
    });

    this.introSeen = window.localStorage.getItem('introSeen');
    this.topBannerSeen = window.localStorage.getItem('topBannerSeen');
    if (this.introSeen !== 'true') {
      this.showIntroductionScreen();
    }
    if (this.topBannerSeen !== 'true') {
      this.showTopBanner();
    }
  }

  ionViewDidLoad() {
    // console.debug('ionViewDidLoad FeedPage');
  }

  ionViewWillLeave() {
    // document.getElementById('tab-0-0').removeEventListener('click', this._fireScrollTop);
    window.localStorage.setItem('topBannerSeen', 'true');
    this.showBanner = false;
    this.disconnectSubscription.unsubscribe();
  }

  ionViewWillEnter() {
    // this.events.publish('feedback:show', { msg: 'Load Feed' });
    this.isOnline = this.network.type !== 'none';
    this.disconnectSubscription = this.network.onchange().subscribe(() => {
      this.isOnline = this.network.type !== 'none';
    });
    if (this.feed.length === 0) {
      try {
        this.feed = JSON.parse(window.localStorage.getItem('feedCache') || '[]');
        this.user = JSON.parse(window.localStorage.getItem('feedUserCache') || 'boom');
      } catch (err) {
        console.warn('failed to get cached data', err);
      }
    }
    this.getFeed();
    this.getUserDetails();
    // document.getElementById('tab-0-0').addEventListener('click', this._fireScrollTop);
  }

  getUserDetails() {
    this.userService
      .getCurrentUser()
      .subscribe(
      (response: Response) => {
        this.user = response.json();
        window.localStorage.setItem('feedUserCache', JSON.stringify(this.user));
      },
      () => {
        if (window.localStorage.getItem('feedUserCache') === null) {
          let failAlert = this.alertCtrl.create({
            title: 'Oops!',
            subTitle: 'Failed to fetch user details',
            buttons: ['OK']
          });
          failAlert.present();
        }
      }
      );
  }

  openProfile() {
    const tabs: Tabs = this.nav.parent;
    tabs.select(4);
    window.localStorage.setItem('topBannerSeen', 'true');
    this.showBanner = false;
  }

  showIntroductionScreen() {
    this.showIntro = true;
  }

  showTopBanner() {
    this.showBanner = true;
  }

  dismissIntroScreen() {
    this.showIntro = false;
    // document.getElementById('home-intro-state').style.display = 'none';
    window.localStorage.setItem('introSeen', 'true');
  }

  getFeed(event?) {
    console.debug('getFeed');
    let date: Date = new Date(Date.now());
    let hours = date.getHours();
    this.isDay = (hours > 6) && (hours < 19);
    this.feedService.getFeed((response: Response) => {
      if (response.text() !== JSON.stringify(this.feed)) {
        this.feed = response.json();
        window.localStorage.setItem('feedCache', JSON.stringify(this.feed));
        console.debug('we has feed', this.feed);
      }
      if (event) {
        event.complete();
      }
    }, failureResponse => {
      if (window.localStorage.getItem('feedCache') === null) {
        this.events.publish('feedback:show', { msg: 'Couldn\'t get feed', icon: 'alert' });
      }
    });
  }

  public released(event) {
    if (this.isOnline) {
      this.getFeed(event);
    } else if (event) {
      event.complete();
    }
  }

  public openModal() {
    const tabs: Tabs = this.nav.parent;
    tabs.select(2);
    window.localStorage.setItem('topBannerSeen', 'true');
    this.showBanner = false;
  }

  inviteSuccess(contacts) {
    let modal = this.modalCtrl.create(SelectContactsModalPage, { contacts });
    modal.onDidDismiss((contacts) => {
      this.authService.inviteContacts(contacts).subscribe(
        (response: Response) => {
          if (Environment.HEAP && 'heap' in window) {
            heap.track('FRIEND_INVITE_SENT');
          }
          this.events.publish('feedback:show', { msg: 'Success!', icon: 'checkmark' });
          this.nav.parent.select(0);
        },
        (response: Response) => {
          let errorMsg = response.statusText;
          try {
            errorMsg = JSON.stringify(response.json());
          } catch (e) {
            console.warn('authService.inviteContacts err not json', e);
          }
          const failAlert = this.alertCtrl.create({
            title: 'Oops!',
            subTitle: 'Something went wrong [' + response.status + ']: ' + errorMsg,
            buttons: ['OK']
          });
          failAlert.present();
        }
      );
    });
    modal.present();
  }

  inviteError() {
    const failAlert = this.alertCtrl.create({
      title: 'Oops!',
      subTitle: 'Unable to invite friends',
      buttons: ['OK']
    });
    failAlert.present();
  }

  fbConnect(auth) {
    // noinspection TypeScriptUnresolvedVariable
    this.facebookService.findFriends(auth.authResponse.accessToken)
      .subscribe(
      (response: Response) => {
        if (200 <= response.status && response.status <= 204) {
          if (Environment.HEAP && 'heap' in window) {
            heap.track('FRIEND_INVITE_FACEBOOK');
          }
          this.events.publish('feedback:show', { msg: 'Success!', icon: 'checkmark' });
          this.nav.parent.select(0);
        } else if (response.status === 422) {
          // TODO which side does this actually happen?
          this.alreadyLinked.present();
        } else {
          let errorMsg = response.statusText;
          try {
            errorMsg = JSON.stringify(response.json());
          } catch (e) {
            console.warn('authService.inviteContacts err not json', e);
          }
          const failAlert = this.alertCtrl.create({
            title: 'Oops!',
            subTitle: 'Something went wrong [' + response.status + ']: ' + errorMsg,
            buttons: ['OK']
          });
          failAlert.present();
        }
      },
      (response: Response) => {
        if (response.status === 422) {
          // TODO which side does this actually happen?
          this.alreadyLinked.present();
        } else {
          let errorMsg = response.statusText;
          try {
            errorMsg = JSON.stringify(response.json());
          } catch (e) {
            console.warn('authService.inviteContacts err not json', e);
          }
          const failAlert = this.alertCtrl.create({
            title: 'Oops!',
            subTitle: 'Something went wrong [' + response.status + ']: ' + errorMsg,
            buttons: ['OK']
          });
          failAlert.present();
        }
      }
      );
  }

  fbError(error) {
    console.error(error);
  }

}
