import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, Events } from 'ionic-angular';
import { UserService } from '../../providers/user-service/user-service';
import { NavigationService } from '../../providers/navigation-service/navigation-service';
import { InterestPickerComponent } from '../../components/interest-picker/interest-picker';

// @IonicPage()
@Component({
  selector: 'page-interests',
  templateUrl: 'interests.html',
})
export class InterestsPage {
  private selectedInterests: Array<Object> = [];
  private initSelectedInterests: Array<Object> = [];
  private lastPage = false;

  constructor(private nav: NavController,
    private alertCtrl: AlertController,
    private userService: UserService,
    public params: NavParams,
    private events: Events) {
    events.subscribe('slide-changed', (events) => {
      let event = events[0];
      this.lastPage = event.isEnd;
    });
    this.fetchUserInterests();
  }

  showError(message?) {
    let errorAlert = this.alertCtrl.create({
      title: 'Oops!',
      subTitle: message || 'Something went wrong',
      buttons: ['OK']
    });
    errorAlert.present();
  }

  onSelectInterest(selected) {
    if (this.initSelectedInterests.length <= InterestPickerComponent.bucketSize) {
      this.lastPage = true;
    }
    this.selectedInterests = selected.map(item => item.interestID);
  }

  submitInterests() {
    let interests = this.selectedInterests;

    if (this.params.data.editMode) {
      this.userService.updateSelectedInterests(
        interests,
        (response: Response) => {
          this.events.publish('user:updated', response.json());
          this.nav.pop();
        },
        (response: Response) => this.showError()
      );
    } else {
      this.userService.setSelectedInterests(
        interests,
        (response: Response) => {
          this.nav.setRoot(NavigationService.nextOnboardingPage(response.json()));
        },
        (response: Response) => this.showError()
      );
    }
  }

  nextPage() {
    this.events.publish('change-slide', 2);
    this.lastPage = true;
  }

  private fetchUserInterests() {
    this.userService.getCurrentUserInterests().subscribe((response) => {
      this.selectedInterests = response.json().interests.map(interest => interest.interestID);
      this.initSelectedInterests = response.json().interests.map(interest => interest.interestID);
    });
  }
}
