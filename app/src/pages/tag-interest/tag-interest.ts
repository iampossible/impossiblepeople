import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

//@IonicPage()
@Component({
  selector: 'page-tag-interest',
  templateUrl: 'tag-interest.html',
})
export class TagInterestPage {
  private selectedInterests: Array<Object> = [];
  private defaultInterests: Array<String> = [];

  constructor(private nav: NavController,
              private viewCtrl: ViewController,
              private params: NavParams) {
    this.defaultInterests = params.data.defaultInterests || [];
  }


  onSelectInterest(selected){
    this.selectedInterests = selected;
  }

  dismissModal() {
    this.viewCtrl.dismiss([]);
  }

  private submitInterests() {
    this.viewCtrl.dismiss(this.selectedInterests);
  }
}
