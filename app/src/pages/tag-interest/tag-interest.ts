import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

// @IonicPage()
@Component({
  selector: 'page-tag-interest',
  templateUrl: 'tag-interest.html',
})
export class TagInterestPage {
  private selectedInterests: Array<Object> = [];
  private defaultInterests: Array<String> = [];

  constructor(
    private viewCtrl: ViewController,
    private params: NavParams) {
    this.defaultInterests = this.params.data.defaultInterests || [];
  }


  onSelectInterest(selected) {
    this.selectedInterests = selected;
  }

  dismissModal() {
    this.viewCtrl.dismiss([]);
  }

  submitInterests() {
    this.viewCtrl.dismiss(this.selectedInterests);
  }
}
