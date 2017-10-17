import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheet, Events, AlertController, ActionSheetController } from 'ionic-angular';
import { Response } from '@angular/http';
import { InAppBrowser } from '@ionic-native/in-app-browser';

import { ProfileService } from '../../providers/profile-service/profile-service';
import { Environment } from '../../Environment';
import { SettingsPage } from '../settings/settings';

declare const heap: any;

//@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  private user: any = {};
  private viewing: string;
  private myProfile: boolean = false;
  private actionSheet: ActionSheet;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private events: Events,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private profileService: ProfileService,
    private iab: InAppBrowser) {

    this.viewing = this.navParams.get('userID');
    let current = localStorage.getItem('USER_ID');
    if (!this.viewing) {
      this.viewing = current;
    }
    this.myProfile = (this.viewing === current);

    this.events.subscribe('user:posts:updated', (post) => {
      if (this.user.userID !== post[0].author.userID) {
        return;
      }

      this.loadProfileData();
    });

    events.subscribe('user:updated', (dataArray) => {
      if (this.user.userID !== this.viewing) {
        return;
      }

      let updated = Array.isArray(dataArray) ? dataArray[0] : dataArray;
      if (updated) {
        this.user = Object.assign(this.user, updated);
      } else {
        this.loadProfileData();
      }
    });
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter ProfilePage');
    this.loadProfileData();
  }


  private onLoadError() {
    this.navCtrl.pop().then(() => {
      let loadErrorAlert = this.alertCtrl.create({
        title: 'Could not load profile data',
        subTitle: '',
        buttons: ['OK']
      });
      loadErrorAlert.present();
    });
  }


  private loadProfileData() {
    this.profileService
      .getProfile(this.viewing)
      .subscribe((response: Response) => {
        this.user = response.json();
      }, () => this.onLoadError());
  }

  openProfileWeblink() {
    if (this.user.url) {
      this.iab.create(this.user.url, '_system');
    }
  }

  private openSettings() {
    this.navCtrl.push(SettingsPage);
  }

  private openPublicSettings() {
    event.stopPropagation();
    this.actionSheet = this.actionSheetCtrl.create({
      title: 'Profile actions',
      buttons: [
        {
          text: 'Block User',
          role: 'destructive',
          handler: () => {
            this.actionSheet.dismiss();
            this.blockUser();
          }
        }
        , {
          text: 'Report User',
          role: 'destructive',
          handler: () => {
            this.actionSheet.dismiss();
            this.reportUser();
          }
        }, {
          text: 'Cancel',
          role: 'cancel',
        }
      ]
    });

    this.actionSheet.present();
  }

  private setFollowing() {
    if (this.user.following) {
      this.profileService.unfollow(this.user.userID).subscribe(() => {
        if (Environment.HEAP && 'heap' in window) {
          heap.track('UNFOLLOW', { userID: this.user.userID });
        }
        this.user.following = !this.user.following;
      }, (error) => {
        let errorAlert = this.alertCtrl.create({
          title: 'Oops!',
          subTitle: 'Something went wrong',
          buttons: ['OK']
        });
        errorAlert.present();
      });
    } else {
      this.profileService.follow(this.user.userID).subscribe(() => {
        if (Environment.HEAP && 'heap' in window) {
          heap.track('FOLLOW', { userID: this.user.userID });
        }
        this.user.following = !this.user.following;
      }, (error) => {
        let errorAlert = this.alertCtrl.create({
          title: 'Oops!',
          subTitle: 'Something went wrong',
          buttons: ['OK']
        });
        errorAlert.present();
      });
    }
  }

  private blockUser() {
    this.profileService.block(this.user.userID).subscribe(() => this.onBlockUser(), () => this.onLoadError());
  }

  private onBlockUser() {
    this.navCtrl.pop()
      .then(() => {
        this.events.publish('feedback:show', {
          msg: 'User blocked. You will no longer see each others content.',
          icon: 'checkmark'
        });
      });
  }

  private reportUser() {
    this.profileService.report(this.user.userID).subscribe(() => {
      this.events.publish('feedback:show', {
        msg: `Thank you! We will review this user’s account shortly.`,
        icon: 'checkmark'
      });
    }, (error) => {
      let errorAlert = this.alertCtrl.create({
        title: 'Oops!',
        subTitle: 'Something went wrong',
        buttons: ['OK']
      });
      errorAlert.present();
    });
  }

}
