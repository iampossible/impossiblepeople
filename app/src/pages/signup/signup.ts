import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { TermsConditionsPage } from '../terms-conditions/terms-conditions';
import { PrivacyPolicyPage } from '../privacy-policy/privacy-policy';
import { NavigationService } from '../../providers/navigation-service/navigation-service';
import { NotificationService } from '../../providers/notification-service/notification-service';
import { UserService } from '../../providers/user-service/user-service';
import { Environment } from '../../Environment';

declare const heap: any;

// @IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  private signUpForm: FormGroup;
  private controlError;

  constructor(private nav: NavController,
    public navParams: NavParams,
    private userService: UserService,
    private form: FormBuilder,
    private notificationService: NotificationService) {
    this.signUpForm = this.form.group({
      email: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.controlError = {};
  }

  showTerms() {
    this.nav.push(TermsConditionsPage);
  }

  showPrivacy() {
    this.nav.push(PrivacyPolicyPage);
  }

  signUp(event) {
    console.log(event);
    if (this.signUpForm.valid) {
      if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(this.signUpForm.value.email)) {
        this.userService.createUser(
          {
            email: this.signUpForm.value.email,
            password: this.signUpForm.value.password,
            firstName: this.signUpForm.value.firstName,
            lastName: this.signUpForm.value.lastName,
          },
          this.signUpSuccess,
          this.signUpFailure
        );
      } else {
        this.controlError = {
          email: true,
          message: 'Please enter a valid email address'
        };
      }
    } else {
      this.controlError = {
        email: this.signUpForm.controls['email'].errors,
        password: this.signUpForm.controls['password'].errors,
        firstName: this.signUpForm.controls['firstName'].errors,
        lastName: this.signUpForm.controls['lastName'].errors,
        message: 'Please provide all required fields',
      };
      console.error('ERRORS', this.controlError);
    }
  }

  signUpSuccess = (response: Response) => {
    if (Environment.HEAP && 'heap' in window) {
      heap.track('SIGNUP_EMAIL');
    }

    this.notificationService.setupOnLaunch();
    this.nav.setRoot(NavigationService.nextOnboardingPage(response.json()));
  }

  signUpFailure = () => {
    this.controlError = {
      email: true,
      message: 'An account has already been created for this email address',
    };
  }

}
