import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { ExploreService } from '../../providers/explore-service/explore-service';

import { FeedService } from '../../providers/feed-service/feed-service';
/**
 * Generated class for the ExplorePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-explore',
  templateUrl: 'explore.html',
})
export class ExplorePage {

  public exploreFeed: Array<Object> = [];


  public feed: Array<Object> = [];

  constructor(private exploreService: ExploreService, 
  private feedService: FeedService, 
  public navCtrl: NavController, 
  public navParams: NavParams) {
    
  }

  getFeed(event?) {
    console.log('getFeed');
    this.feedService.getFeed(response => {
      this.feed = response.json();
      console.log('we has feed', this.feed);
      if (event) {
        event.complete();
      }
    });
  }

  getExploreFeed(interest, event?) {
    console.log('getExploreFeed');
    this.exploreService.getExploreFeed(interest, response => {
      this.exploreFeed = response.json();
      console.log('we has feed', this.exploreFeed);
      if (event) {
        event.complete();
      }
    });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ExplorePage');
    this.getFeed();
  }

  onInput(event){

  }
  onCancel(event){
    
  }

}
