import {Component} from '@angular/core'
import {ControlGroup, FormBuilder} from '@angular/common'
import {Response} from '@angular/http'
import {Page, NavController} from 'ionic-angular'
import {TermsConditionsPage} from '../../ProfilePage/SettingsPage/PreferencesPage/TermsConditionsPage/TermsConditionsPage'
import {PrivacyPolicyPage} from '../../ProfilePage/SettingsPage/PreferencesPage/PrivacyPolicyPage/PrivacyPolicyPage'

import {UserService} from '../../../services/api/ApiService'
import {NavigationService} from '../../../services/navigation/NavigationService'

import {Environment} from '../../../Environment'
import {NotificationService} from '../../../services/NotificationService'

declare const heap: any

@Component({
  templateUrl: 'build/pages/User/SignUpPage/SignUpPage.html',
})
export class SignUpPage {
  private signUpForm: ControlGroup
  private controlError

  constructor(private nav: NavController,
              private userService: UserService,
              private form: FormBuilder,
              private notificationService: NotificationService) {
    this.signUpForm = form.group({
      email: [''],
      firstName: [''],
      lastName: [''],
      password: [''],
    })
    this.controlError = {}
  }

  showTerms() {
    this.nav.push(TermsConditionsPage)
  }

  showPrivacy() {
    this.nav.push(PrivacyPolicyPage)
  }

  signUp(event) {
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
        )
      } else {
        this.controlError = {
          email: true,
          message: 'Please enter a valid email address'
        }
      }
    } else {
      this.controlError = {
        email: this.signUpForm.controls['email'].errors,
        password: this.signUpForm.controls['password'].errors,
        firstName: this.signUpForm.controls['firstName'].errors,
        lastName: this.signUpForm.controls['lastName'].errors,
        message: 'Please provide all required fields',
      }
    }
  }

  signUpSuccess = (response: Response) => {
    if (Environment.HEAP && 'heap' in window) {
      heap.track('SIGNUP_EMAIL')
    }

    this.notificationService.setupOnLaunch()
    this.nav.setRoot(NavigationService.nextOnboardingPage(response.json()))
  }

  signUpFailure = () => {
    this.controlError = {
      email: true,
      message: 'An account has already been created for this email address',
    }
  }
}
