import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, Events } from 'ionic-angular';

import { ExploreService } from '../../providers/explore-service/explore-service';

interface Interest {
  name: String;
  featured: Boolean;
  image: String;
  interestID: String;
  suggested: Boolean;
}

// @IonicPage()
@Component({
  selector: 'page-explore',
  templateUrl: 'explore.html',
})
export class ExplorePage {
  static bucketSize = 10;

  public isAndroid: Boolean = false;
  public inExplore: Boolean = true;
  public loading: Boolean = false;
  public feed: Array<Object> = [];
  public interests: Array<Interest> = [];
  public pages: Array<Array<Interest>> = [];
  private searchString: String = '';
  private interest: String = '';

  constructor(private exploreService: ExploreService,
    public navCtrl: NavController,
    public platform: Platform,
    private events: Events,
    public navParams: NavParams) {
    this.isAndroid = platform.is('android');
  }

  // To be used when something unexpected goes wrong
  resetPage() {
    this.inExplore = true;
    this.loading = false;
    this.feed = [];
    this.interests = [];
    this.pages = [];
    this.interest = '';
    this.searchString = '';
    this.exploreService.getInterests(response => {
      this.interests = response.json();
      this.pages = this.paginate();
      console.debug('we has interests', this.interests);
    }, (failureResponse: Response) => {
      console.warn(failureResponse.statusText, failureResponse);
      this.inExplore = false;
    });
  }

  getExploreFeed(event?) {
    this.inExplore = false;
    this.interest = event.srcElement.textContent;
    this.loading = true;
    this.feed = [];
    console.debug('getExploreFeed for:', this.interest);
    this.exploreService.getExploreFeed(this.interest, response => {
      this.feed = response.json();
      this.loading = false;
      console.debug('we has explore feed', this.feed);
    }, (failureResponse: Response) => {
      console.warn(failureResponse.statusText, failureResponse);
      this.inExplore = true;
      this.events.publish('feedback:show', { msg: 'Couldn\'t show ' + this.interest, icon: 'alert' });
      this.interest = '';
      this.loading = false;
    });
  }

  exitExploreFeed(event) {
    console.debug('exitExploreFeed');
    this.inExplore = true;
    this.feed = [];
    this.searchString = '';
    this.interest = '';
  }

  ionViewWillEnter() {
    console.debug('ionViewWillEnter ExplorePage');
    this.resetPage();
  }

  private paginate(): Array<Array<Interest>> {
    let buckets: Array<Array<Interest>> = [];

    for (let i = 0; i < this.interests.length; i += ExplorePage.bucketSize) {
      buckets.push(this.interests.slice(i, i + ExplorePage.bucketSize));
    }

    return buckets;
  }

  getImage(interest) {
    return `url(${interest.image.replace('build', 'assets')})`;
  }

  randomExplore(event) {
    this.inExplore = false;
    this.loading = true;
    this.feed = [];
    let idx = Math.floor(Math.random() * (this.interests.length - 0) + 0);
    this.interest = (this.interests[idx]).name;
    console.debug('randomExplore for:', this.interest);
    this.exploreService.getExploreFeed(this.interest, response => {
      this.feed = response.json();
      this.loading = false;
      console.debug('we has random ', this.interest, ' feed', this.feed);
    }, (failureResponse: Response) => {
      console.warn(failureResponse.statusText, failureResponse);
      this.inExplore = true;
      this.events.publish('feedback:show', { msg: 'Couldn\'t show ' + this.interest, icon: 'alert' });
      this.interest = '';
      this.loading = false;
    });

  }

  onSearch(event) {
    const searchText = this.searchString.toLowerCase();
    console.debug('onSearch = ', searchText);
    this.loading = true;
    const fallbackFeed = this.feed;
    this.feed = [];
    const successFn = response => {
      this.feed = response.json();
      this.loading = false;
      console.debug('we has search feed', this.feed);
    };
    const failFn = (failureResponse: Response) => {
      console.warn(failureResponse.statusText, failureResponse);
      if (!searchText) {
        this.inExplore = true;
        this.events.publish('feedback:show', { msg: 'Couldn\'t show ' + this.interest, icon: 'alert' });
        this.interest = '';
        this.loading = false;
      } else {
        this.events.publish('feedback:show', { msg: 'Couldn\'t get ' + this.searchString || this.interest, icon: 'alert' });
        this.searchString = '';
        this.feed = fallbackFeed;
        this.loading = false;
      }
    };
    if (!searchText) {
      this.exploreService.getExploreFeed(this.interest, successFn, failFn);
    } else {
      this.exploreService.getExploreSearch(this.interest || '_', this.searchString.toLowerCase(), successFn, failFn);
    }
  }

  clearSearch(event) {
    if (!this.searchString) {
      return;
    }
    this.searchString = '';
    this.loading = true;
    this.feed = [];
    this.exploreService.getExploreFeed(this.interest, response => {
      this.feed = response.json();
      this.loading = false;
      console.debug('we has explore feed', this.feed);
    }, (failureResponse: Response) => {
      console.warn(failureResponse.statusText, failureResponse);
      this.inExplore = true;
      this.events.publish('feedback:show', { msg: 'Couldn\'t show ' + this.interest, icon: 'alert' });
      this.interest = '';
      this.loading = false;
    });
  }
}
