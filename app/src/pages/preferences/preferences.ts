import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheet, Events, ActionSheetController } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service/auth-service';
import { Environment } from '../../Environment';
import { PrivacyPolicyPage } from '../privacy-policy/privacy-policy';
import { TermsConditionsPage } from '../terms-conditions/terms-conditions';
import { Facebook } from '@ionic-native/facebook';
import { EmailPage } from '../email/email';
import { AppVersion } from '@ionic-native/app-version';

declare var heap: any;

// @IonicPage()
@Component({
  selector: 'page-preferences',
  templateUrl: 'preferences.html',
})
export class PreferencesPage {
  private user;
  private version: string;
  private appName: string = '';
  logoutOptions: ActionSheet;

  constructor(private nav: NavController,
    private params: NavParams,
    private events: Events,
    private actionSheetCtrl: ActionSheetController,
    private authService: AuthService,
    private appVersion: AppVersion,
    private facebook: Facebook) {
    this.user = this.params.data;
    appVersion.getAppName().then(v => this.appName = v);
    appVersion.getVersionNumber().then(v => this.version = v).catch(() => this.version = Environment.version);
    this.events.subscribe('user:updated', (dataArray) => {
      let updated = Array.isArray(dataArray) ? dataArray[0] : dataArray;
      if (updated) {
        this.user = Object.assign(this.user, updated);
      }
    });
  }

  changeEmail() {
    this.nav.push(EmailPage, this.user);
  }

  privacyPolicy() {
    this.nav.push(PrivacyPolicyPage);
  }

  termsConditions() {
    this.nav.push(TermsConditionsPage);
  }

  _doLogout(reason?: any): void {
    setTimeout(() => {
      window.location.href = window.location.href.split('#').shift();
    }, 333);
  }

  logOut() {
    this.logoutOptions = this.actionSheetCtrl.create({
      buttons: [
        {
          handler: () => {
            this.logoutOptions.dismiss();
            this.authService.logOut().subscribe(() => {
              if (Environment.HEAP && 'heap' in window) {
                heap.track('LOGOUT');
              }
              if (this.user.fromFacebook) {
                this.facebook.logout().then(this._doLogout).catch(this._doLogout);
              } else {
                this._doLogout();
              }
              window.localStorage.clear();
            });
          },
          role: 'destructive',
          text: 'Log out'
        },
        { role: 'cancel', text: 'Cancel' },
      ],
    });
    this.logoutOptions.present();
  }
}
