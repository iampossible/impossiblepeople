import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { ExploreService } from '../../providers/explore-service/explore-service';
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
  private searchString : String = '';
  private interest : String = '';

  constructor(private exploreService: ExploreService, 
  public navCtrl: NavController, 
  public navParams: NavParams) {

  }

  getExploreFeed(event?) {
    this.inExplore = false;
    this.inSearchExplore = true;
    this.interest =  event.srcElement.textContent;
    console.log('getExploreFeed for:', this.interest);
    this.exploreService.getExploreFeed(this.interest, response => {
      this.feed = response.json();
      console.log('we has explore feed', this.feed);
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
  getImage(interest){
    return `url(${interest.image.replace('build','assets')})`;
  }
  randomExplore(event){
    this.inExplore = false;
    this.inSearchExplore = true;
    let idx = Math.floor(Math.random() * (this.interests.length - 0) + 0);
    this.interest = (this.interests[idx]).name;
    console.log('getExploreFeed for:', this.interest);
    this.exploreService.getExploreFeed(this.interest, response => {
      this.feed = response.json();
      console.log('we has random feed', this.feed);
    });

  }

  onSearch(event){
    console.log('onSearch = ', this.searchString);
    this.exploreService.getExploreSearch(this.interest, this.searchString, response => {
      this.feed = response.json();
      console.log('we has search feed', this.interests);
    });
  }

  clearSearch($event){
    this.exploreService.getExploreFeed(this.interest, response => {
      this.feed = response.json();
      console.log('we has explore feed', this.feed);
    });
  }
}
