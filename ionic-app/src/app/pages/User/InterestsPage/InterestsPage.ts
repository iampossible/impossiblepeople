import {Component} from '@angular/core'
import {Response} from '@angular/http'
import {AlertController, NavController, NavParams, Events} from 'ionic-angular'

import {UserService} from '../../../services/api/ApiService'
import {InterestPicker} from '../../../components/InterestPicker/InterestPicker'
import {NavigationService} from '../../../services/navigation/NavigationService'

@Component({
  templateUrl: 'build/pages/User/InterestsPage/InterestsPage.html',
  directives: [InterestPicker]
})
export class InterestsPage {
  private featuredInterests: Array<Object> = []
  private formattedInterests: Array<Object> = []
  private selectedInterests: Array<Object> = []
  private initSelectedInterests: Array<Object> = []
  private lastPage = false

  constructor(private nav: NavController,
              private alertCtrl: AlertController,
              private userService: UserService,
              public params: NavParams,
              private events: Events) {
    events.subscribe('slide-changed', (events) => {
      let event = events[0]
      this.lastPage = event.isEnd
    })
    this.fetchUserInterests()
  }

  showError(message?) {
    let errorAlert = this.alertCtrl.create({
      title: 'Oops!',
      subTitle: message || 'Something went wrong',
      buttons: ['OK']
    })
    errorAlert.present()
  }

  onSelectInterest(selected) {
    if (this.initSelectedInterests.length <= InterestPicker.bucketSize) {
      this.lastPage = true;
    }
    this.selectedInterests = selected.map(item => item.interestID)
  }

  private submitInterests() {
    let interests = this.selectedInterests

    if (this.params.data.editMode) {
      this.userService.updateSelectedInterests(
        interests,
        (response: Response) => {
          this.events.publish('user:updated', response.json())
          this.nav.pop()
        },
        (response: Response) => this.showError()
      )
    } else {
      this.userService.setSelectedInterests(
        interests,
        (response: Response) => {
          this.nav.setRoot(NavigationService.nextOnboardingPage(response.json()))
        },
        (response: Response) => this.showError()
      )
    }
  }

  private nextPage() {
    this.events.publish('change-slide', 2)
    this.lastPage = true
  }

  private fetchUserInterests() {
    this.userService.getCurrentUserInterests().subscribe((response) => {
      this.selectedInterests = response.json().interests.map(interest => interest.interestID)
      this.initSelectedInterests = response.json().interests.map(interest => interest.interestID)
    })
  }

}
