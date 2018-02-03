import { Component } from '@angular/core';
import { NavController, Events, AlertController, ModalController } from 'ionic-angular';
import { Response } from '@angular/http';

import { NavigationService } from '../../providers/navigation-service/navigation-service';
import { AddLocationModalPage } from '../add-location-modal/add-location-modal';
import { TabsPage } from '../tabs/tabs';
import { UserService } from '../../providers/user-service/user-service';

// @IonicPage()
@Component({
  selector: 'page-add-location-context',
  templateUrl: 'add-location-context.html',
})
export class AddLocationContextPage {


  constructor(private nav: NavController,
    private userService: UserService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private events: Events) {
  }

  skipLocation() {
    this.nav.setRoot(TabsPage);
  }

  shareLocation() {
    var modal = this.modalCtrl.create(AddLocationModalPage);
    modal.onDidDismiss((result) => {
      if (result.state === 'success') {
        this.continueOnboarding(result.data);
      } else if (result.state === 'noop') {
        // do nothing, the user "skipped"
      } else {
        let failAlert = this.alertCtrl.create({
          title: 'Failed to update location',
          subTitle: 'Please go to your settings and allow Impossible to access your location.',
          buttons: ['OK'],
        });
        failAlert.present();
      }
    });
    modal.present();
  }

  continueOnboarding(data) {
    this.userService.updateUser(data).subscribe(
      (response: Response) => {
        let user = response.json();
        this.events.publish('user:updated', user);
        this.nav.setRoot(NavigationService.nextOnboardingPage(user));
      },
      (response: Response) => {
        let failModal = this.modalCtrl.create({
          title: 'Oops!',
          subTitle: 'Something went wrong',
          buttons: ['OK']
        });
        failModal.present();
      });
  }

}
