import { Component } from '@angular/core';
import { NavController, NavParams, Platform, Events } from 'ionic-angular';
import { ExploreService } from '../../providers/explore-service/explore-service';

// @IonicPage()
@Component({
  selector: 'page-explore-interest',
  templateUrl: 'explore-interest.html',
})
export class ExploreInterestPage {
  public loading = false;
  public feed: Array<Object> = [];
  public isAndroid: Boolean = false;
  public interest: String;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private exploreService: ExploreService,
    public platform: Platform,
    private events: Events, ) {
    this.isAndroid = platform.is('android');
    this.interest = navParams.get('interest');
  }

  ionViewWillEnter() {
    console.debug('ionViewWillEnter ExploreInterestPage');
    this.getExploreFeed();
  }

  ionViewWillLeave() {
    if (!this.navCtrl.isTransitioning() && this.navCtrl.canGoBack()) {
      this.navCtrl.pop();
    }
  }

  getExploreFeed() {
    this.loading = true;
    this.feed = [];
    console.debug('getExploreFeed for:', this.interest);
    this.exploreService.getExploreFeed(this.interest, response => {
      this.feed = response.json();
      this.loading = false;
      console.debug('we has explore feed', this.feed);
    }, (failureResponse: Response) => {
      console.warn(failureResponse.statusText, failureResponse);
      this.events.publish('feedback:show', { msg: 'Couldn\'t show ' + this.interest, icon: 'alert' });
      this.loading = false;
      this.navCtrl.pop();
    });
  }
}
