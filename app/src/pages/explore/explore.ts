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

  public inExplore: Boolean = true;
  public inSearchExplore: Boolean = false;
  public feed: Array<Object> = [];
  public interests : Array<Object> = [];

  constructor(private exploreService: ExploreService, 
  public navCtrl: NavController, 
  public navParams: NavParams) {

  }

  getExploreFeed(event?) {
    this.inExplore = false;
    this.inSearchExplore = true;
    console.log('getExploreFeed for:', event.srcElement.textContent);
    this.exploreService.getExploreFeed(event.srcElement.textContent, response => {
      this.feed = response.json();
      console.log('we has feed', this.feed);
    });
  }
  
  exitExploreFeed(event){
    console.log("exitExploreFeed");
    this.inExplore = true;
    this.inSearchExplore = false;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ExplorePage');
    this.inExplore = true;
    this.inSearchExplore = false;
    this.exploreService.getInterests(response => {
      this.interests = response.json();
      console.log('we has interests', this.interests);
    });
  }

}
