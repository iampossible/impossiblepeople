import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

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

  private interestForm: FormGroup;
  public exploreFeed: Array<Object> = [];

  public feed: Array<Object> = [];

  constructor(private exploreService: ExploreService, 
  private feedService: FeedService, 
  private form: FormBuilder,
  public navCtrl: NavController, 
  public navParams: NavParams) {
    this.interestForm = form.group({
      interest1: ['Lifestyle', Validators.required],
      interest2: ['Travel', Validators.required],
      interest3: ['Technology', Validators.required],
      interest4: ['Music', Validators.required],
      interest5: ['Art Design', Validators.required],
      interest6: ['Wellness', Validators.required],
      interest7: ['Politics', Validators.required],
      interest8: ['Culture', Validators.required],
      interest9: ['Surprise me', Validators.required],
    });
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
    //this.getFeed();
  }

  getInterest(event){
    event.
    console.log("interest", this.interestForm.value.interest1);
  }

}
