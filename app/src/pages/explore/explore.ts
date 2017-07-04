import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { ExploreService } from '../../providers/explore-service/explore-service';

interface Interest {
  name: String;
  featured: Boolean;
  image: String;
  interestID: String;
  suggested: Boolean;
}

@IonicPage()
@Component({
  selector: 'page-explore',
  templateUrl: 'explore.html',
})
export class ExplorePage {

  public inExplore: Boolean = true;
  public inSearchExplore: Boolean = false;
  public emptyFeed: Boolean = false;
  public feed: Array<Object> = [];
  public interests : Array<Interest> = [];
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
      if(this.feed.length == 0)
        this.emptyFeed = true;
      else
        this.emptyFeed = false;
      console.log('we has explore feed', this.feed);
    });
  }
  
  exitExploreFeed(event){
    console.log("exitExploreFeed");
    this.inExplore = true;
    this.inSearchExplore = false;
    this.emptyFeed = false;
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
      if(this.feed.length == 0)
        this.emptyFeed = true;
      else
        this.emptyFeed = false;
      console.log('we has random feed', this.feed);
    });

  }

  onSearch(event){
    console.log('onSearch = ', this.searchString.toLowerCase());
    this.exploreService.getExploreSearch(this.interest, this.searchString.toLowerCase(), response => {
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
