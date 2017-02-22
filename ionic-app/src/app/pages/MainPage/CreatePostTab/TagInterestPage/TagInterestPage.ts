import {NavController, ViewController, NavParams} from 'ionic-angular'
import {Component} from '@angular/core'
import {InterestPicker} from '../../../../components/InterestPicker/InterestPicker';

@Component({
  templateUrl: 'build/pages/MainPage/CreatePostTab/TagInterestPage/TagInterestPage.html',
  directives: [InterestPicker]
})
export class TagInterestPage {
  private selectedInterests:Array<Object> = []
  private defaultInterests:Array<String> = []

  constructor(private nav:NavController,
              private viewCtrl:ViewController,
              private params:NavParams) {
    this.defaultInterests = params.data.defaultInterests || []
  }


  onSelectInterest(selected){
    this.selectedInterests = selected
  }

  dismissModal() {
    this.viewCtrl.dismiss([])
  }

  private submitInterests() {
    this.viewCtrl.dismiss(this.selectedInterests)
  }
}
