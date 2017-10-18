import { Component, ElementRef } from '@angular/core';
import { NavController, NavParams, Events, AlertController, Tabs, Platform } from 'ionic-angular';
import { Response } from '@angular/http';
import { Geolocation } from '@ionic-native/geolocation';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Network } from '@ionic-native/network';

import { FeedService } from '../../providers/feed-service/feed-service';
import { UserService } from '../../providers/user-service/user-service';
import { Subscription } from 'rxjs/Subscription';
// import { ScrollTopProvider } from '../../providers/scroll-top/scroll-top';

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

  constructor(private feedService: FeedService,
    private events: Events,
    private myElement: ElementRef,
    private userService: UserService,
    private alertCtrl: AlertController,
    private nav: NavController,
    public navParams: NavParams,
    public platform: Platform,
    private geolocation: Geolocation,
    private diagnostic: Diagnostic,
    private network: Network) {

    this.isAndroid = platform.is('android');

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

  /*  private _getScrollElement(elem: ElementRef): Element {
      let nodeList: NodeListOf<Element> = elem.nativeElement.getElementsByTagName('scroll-content');
      let elementList: Array<Element>;
      elementList = Array.prototype.slice.call(nodeList);
      return elementList.shift();
    }
  */
  // TODO: add smooth scrolling
  /* private _fireScrollTop = () => {
     if (!this.isScrolling) { // scroll the element top
       this.scrollElement = this._getScrollElement(this.myElement);
       this.isScrolling = true;
       ScrollTopProvider.scrollTop(<HTMLElement>this.scrollElement).then(() => {
         this.getFeed();
         this.isScrolling = false;
       }).catch(() => {
         this.isScrolling = false;
       });
     }
   }*/

  ionViewDidLoad() {
    //console.debug('ionViewDidLoad FeedPage');
  }

  ionViewWillLeave() {
    // document.getElementById('tab-0-0').removeEventListener('click', this._fireScrollTop);
    window.localStorage.setItem('topBannerSeen', 'true');
    this.showBanner = false;
    this.disconnectSubscription.unsubscribe();
  }

  ionViewWillEnter() {
    //this.events.publish('feedback:show', { msg: 'Load Feed' });
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
  public updateLocation() {
    this.loadingLocation = true;
    this.diagnostic.isLocationEnabled().then((resp) => {
      if (resp !== false) {
        this.geolocation.getCurrentPosition()
          .then((resp: Position) => {
            this.userService
              .getFriendlyLocation(resp.coords.latitude, resp.coords.longitude, resp.coords.accuracy)
              .subscribe(
              (response: Response) => {
                const friendlyName = response.json().friendlyName;
                let data = {
                  location: friendlyName,
                  latitude: resp.coords.latitude,
                  longitude: resp.coords.longitude,
                };
                this.events.publish('feedback:show', { msg: 'Location set to ' + friendlyName + '!', icon: 'checkmark' });
                this.loadingLocation = false;
              },
              (response: Response) => {
                console.warn('userService.getFriendlyLocation', response);
                this.events.publish('feedback:show', { msg: 'Couldn\'t find location', icon: 'alert' });
                this.loadingLocation = false;
              }
              );
          })
          .catch((error) => {
            console.warn('geolocation.getCurrentPosition', error);
            this.events.publish('feedback:show', { msg: error.message, icon: 'alert' });
            this.loadingLocation = false;
          });
      } else {
        console.debug('Location services are disabled on the device');
        this.events.publish('feedback:show', { msg: 'Location services are disabled on the device', icon: 'alert' });
        this.loadingLocation = false;
      }
    }).catch((error) => {
      console.debug('diagnostic.isLocationEnabled', error);
      this.events.publish('feedback:show', { msg: 'Couldn\'t find location', icon: 'alert' });
      this.loadingLocation = false;
    });
  }
}
