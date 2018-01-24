import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Response } from '@angular/http';

import { ForgottenPasswordPage } from '../forgotten-password/forgotten-password';
import { NavigationService } from '../../providers/navigation-service/navigation-service';
import { NotificationService } from '../../providers/notification-service/notification-service';
import { AuthService } from '../../providers/auth-service/auth-service';
import { ApiService } from '../../providers/api-service/api-service';
import { Environment } from '../../Environment';


declare const heap: any;

// @IonicPage()
@Component({
  selector: 'page-auth',
  templateUrl: 'auth.html',
})
export class AuthPage {
  private loginForm: FormGroup;
  private controlError;

  constructor(public nav: NavController,
    public navParams: NavParams,
    private authService: AuthService,
    private form: FormBuilder,
    private notificationService: NotificationService) {
    this.loginForm = this.form.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.controlError = {};
  }

  login(event) {
    this.authService.authenticate(
      this.loginForm.value.email,
      this.loginForm.value.password
    ).subscribe(this.loginSuccess, this.loginFailure);
  }

  loginSuccess = (response: Response) => {
    if (response.status === 401) {
      this.loginFailure(response);
      return;
    }

    ApiService.extractID(response);
    if (Environment.HEAP && 'heap' in window) {
      heap.track('LOGIN_EMAIL');
    }

    this.notificationService.setupOnLaunch();
    this.nav.setRoot(NavigationService.nextOnboardingPage(response.json()));
  }

  loginFailure = (response: Response) => {
    if (response.status === 401) {
      this.controlError = {
        email: true,
        message: 'The email and password you entered did not match our records. Please try again.',
        password: true,
      };
    } else {
      this.controlError = { message: 'An error has occurred.' };
    }
  }

  forgotPassword() {
    this.nav.push(ForgottenPasswordPage);
  }

}
