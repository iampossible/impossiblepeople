import { Component } from '@angular/core';
import { NavController, Events, AlertController, ModalController, Alert } from 'ionic-angular';
import { Response } from '@angular/http';

import { FacebookService } from '../../providers/facebook-service/facebook-service';
import { AuthService } from '../../providers/auth-service/auth-service';
import { Environment } from '../../Environment';
import { SelectContactsModalPage } from '../select-contacts-modal/select-contacts-modal';

declare const heap: any;

// @IonicPage()
@Component({
  selector: 'page-find-friends',
  templateUrl: 'find-friends.html',
})
export class FindFriendsPage {
  alreadyLinked: Alert;

  constructor(
    private nav: NavController,
    private facebookService: FacebookService,
    private events: Events,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private authService: AuthService) {
    this.alreadyLinked = this.alertCtrl.create({
      title: 'Account already linked',
      subTitle: 'Another user is already linked to that Facebook account. Please double-check your Facebook credentials.',
      buttons: ['OK'],
    });
  }

  inviteSuccess(contacts) {
    let modal = this.modalCtrl.create(SelectContactsModalPage, { contacts });
    modal.onDidDismiss((contacts) => {
      this.authService.inviteContacts(contacts).subscribe(
        (response: Response) => {
          if (Environment.HEAP && 'heap' in window) {
            heap.track('FRIEND_INVITE_SENT');
          }
          this.events.publish('feedback:show', { msg: 'Success!', icon: 'checkmark' });
          this.nav.parent.select(0);
        },
        (response: Response) => {
          const failAlert = this.alertCtrl.create({
            title: 'Oops!',
            subTitle: 'Something went wrong [' + response.status + ']: ' + JSON.stringify(response.json()),
            buttons: ['OK']
          });
          failAlert.present();
        }
      );
    });
    modal.present();
  }

  inviteError() {
    const failAlert = this.alertCtrl.create({
      title: 'Oops!',
      subTitle: 'Unable to invite friends',
      buttons: ['OK']
    });
    failAlert.present();
  }

  fbConnect(auth) {
    // noinspection TypeScriptUnresolvedVariable
    this.facebookService.findFriends(auth.authResponse.accessToken)
      .subscribe(
      (response: Response) => {
        if (200 <= response.status && response.status <= 204) {
          if (Environment.HEAP && 'heap' in window) {
            heap.track('FRIEND_INVITE_FACEBOOK');
          }
          this.events.publish('feedback:show', { msg: 'Success!', icon: 'checkmark' });
          this.nav.parent.select(0);
        } else if (response.status === 422) {
          // TODO which side does this actually happen?
          this.alreadyLinked.present();
        } else {
          const failAlert = this.alertCtrl.create({
            title: 'Oops!',
            subTitle: 'Something went wrong [' + response.status + ']: ' + JSON.stringify(response.json()),
            buttons: ['OK']
          });
          failAlert.present();
        }
      },
      (response: Response) => {
        if (response.status === 422) {
          // TODO which side does this actually happen?
          this.alreadyLinked.present();
        } else {
          const failAlert = this.alertCtrl.create({
            title: 'Oops!',
            subTitle: 'Something went wrong [' + response.status + ']: ' + JSON.stringify(response.json()),
            buttons: ['OK']
          });
          failAlert.present();
        }
      }
      );
  }

  fbError(error) {
    console.error(error);
  }
}
