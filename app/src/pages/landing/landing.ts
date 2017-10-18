import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController, Slides } from 'ionic-angular';
import { Response } from '@angular/http';

import { ApiService } from '../../providers/api-service/api-service';
import { FacebookService } from '../../providers/facebook-service/facebook-service';
import { NotificationService } from '../../providers/notification-service/notification-service';
import { AuthPage } from '../auth/auth';
import { SignupPage } from '../signup/signup';
import { Environment } from '../../Environment';
import { NavigationService } from '../../providers/navigation-service/navigation-service';

declare const heap: any;

// @IonicPage()
@Component({
  selector: 'page-landing',
  templateUrl: 'landing.html',
})
export class LandingPage {

  @ViewChild(Slides) slides: Slides;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public facebookService: FacebookService,
    public notificationService: NotificationService,
    public alertCtrl: AlertController) {
  }

  goToAuthPage(event) {
    this.navCtrl.push(AuthPage);
  }

  goToSignUpPage(event) {
    this.navCtrl.push(SignupPage);
  }

  fbConnect(auth) {
    // noinspection TypeScriptUnresolvedVariable
    this.facebookService.checkToken(auth.authResponse.accessToken)
      .subscribe(
      (response: Response) => {
        ApiService.extractID(response);
        if (response.status === 200 || response.status === 201) {
          if (Environment.HEAP && 'heap' in window) {
            heap.track('LOGIN_FACEBOOK');
          }
          this.navCtrl.setRoot(NavigationService.nextOnboardingPage(response.json()));
          this.notificationService.setupOnLaunch();
        } else if (response.status === 403) {

          let oppsAlert = this.alertCtrl.create({
            title: 'Not a Facebook user',
            subTitle: 'Please log in using your email address and password',
            buttons: ['OK']
          });

          oppsAlert.present();
        } else {
          let oppsAlert = this.alertCtrl.create({
            title: 'Oops!',
            subTitle: 'Something went wrong: ' + JSON.stringify(response.json()),
            buttons: ['OK']
          });

          oppsAlert.present();
        }
      });
  }

  fbError(error) {
    console.error(error);
  }

}
