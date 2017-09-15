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

// @IonicPage()
@Component({
  selector: 'page-explore',
  templateUrl: 'explore.html',
})
export class ExplorePage {

  public inExplore: Boolean = true;
  public loading: Boolean = false;
  public feed: Array<Object> = [];
  public interests: Array<Interest> = [];
  private searchString: String = '';
  private interest: String = '';

  constructor(private exploreService: ExploreService,
    public navCtrl: NavController,
    public navParams: NavParams) {

  }

  getExploreFeed(event?) {
    this.inExplore = false;
    this.interest = event.srcElement.textContent;
    this.loading = true;
    this.feed = [];
    console.log('getExploreFeed for:', this.interest);
    this.exploreService.getExploreFeed(this.interest, response => {
      this.feed = response.json();
      this.loading = false;
      console.log('we has explore feed', this.feed);
    });
  }

  exitExploreFeed(event) {
    console.log('exitExploreFeed');
    this.inExplore = true;
    this.feed = [];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ExplorePage');
    this.inExplore = true;
    this.exploreService.getInterests(response => {
      this.interests = response.json();
      console.log('we has interests', this.interests);
    });
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
    console.log('randomExplore for:', this.interest);
    this.exploreService.getExploreFeed(this.interest, response => {
      this.feed = response.json();
      this.loading = false;
      console.log('we has random feed', this.feed);
    });

  }

  onSearch(event) {
    console.log('onSearch = ', this.searchString.toLowerCase());
    this.loading = true;
    this.feed = [];
    this.exploreService.getExploreSearch(this.interest, this.searchString.toLowerCase(), response => {
      this.feed = response.json();
      this.loading = false;
      console.log('we has search feed', this.feed);
    });
  }

  clearSearch(event) {
    this.loading = true;
    this.feed = [];
    this.exploreService.getExploreFeed(this.interest, response => {
      this.feed = response.json();
      this.loading = false;
      console.log('we has explore feed', this.feed);
    });
  }
}
