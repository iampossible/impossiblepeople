import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Response } from '@angular/http';

import { LandingPage } from '../landing/landing';
import { AuthService } from '../../providers/auth-service/auth-service';


// @IonicPage()
@Component({
  selector: 'page-forgotten-password',
  templateUrl: 'forgotten-password.html',
})
export class ForgottenPasswordPage {

  private recoverPasswordForm: FormGroup;
  private controlError;

  constructor(private nav: NavController,
    public navParams: NavParams,
    private authService: AuthService,
    private form: FormBuilder,
    private events: Events) {
    this.recoverPasswordForm = this.form.group({
      email: ['', Validators.required],
    });
    this.controlError = {};
  }

  recoverPassword(event) {
    this.authService
      .recoverPassword(this.recoverPasswordForm.value.email)
      .subscribe(this.recoverSuccess, this.recoverFailure);
  }

  recoverSuccess = (response: Response) => {
    if (response.status > 202) {
      return this.recoverFailure(response);
    }
    this.events.publish('feedback:show', { msg: 'Success!', icon: 'checkmark' });
    this.nav.setRoot(LandingPage);
  }

  recoverFailure = (response: Response) => {
    if (response.status === 404) {
      this.controlError = {
        email: true,
        message: 'Please make sure you have entered the correct email address.',
      };
    } else if (response.status === 422) {
      this.controlError = {
        email: true,
        message: 'Please sign in using Facebook. As a Facebook user, you don\'t need to reset your password using this service.',
      };
    } else {
      this.controlError = { message: 'An error has occurred.' };
    }
  }

}
