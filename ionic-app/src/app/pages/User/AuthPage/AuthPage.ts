import {Component} from '@angular/core'
import {ControlGroup, FormBuilder, Validators} from '@angular/common'
import {Response} from '@angular/http'
import {Alert, NavController} from 'ionic-angular'
import {AuthService, ApiService} from '../../../services/api/ApiService'
import {NavigationService} from '../../../services/navigation/NavigationService'
import {ForgottenPasswordPage} from '../../../pages/Pages';
import {Environment} from '../../../Environment'
import {NotificationService} from '../../../services/NotificationService'

declare const heap: any

@Component({
  templateUrl: 'build/pages/User/AuthPage/AuthPage.html',
})
export class AuthPage {
  private loginForm: ControlGroup
  private controlError

  constructor(private nav: NavController,
              private authService: AuthService,
              private form: FormBuilder,
              private notificationService: NotificationService) {
    this.loginForm = form.group({
      email: [''],
      password: [''],
    })
    this.controlError = {}
  }

  login(event) {
    this.authService.authenticate(
      this.loginForm.value.email,
      this.loginForm.value.password
    ).subscribe(this.loginSuccess, this.loginFailure)
  }

  loginSuccess = (response: Response) => {
    if (response.status == 401) {
      this.loginFailure(response)
      return
    }

    ApiService.extractID(response)
    if (Environment.HEAP && 'heap' in window) {
      heap.track('LOGIN_EMAIL')
    }

    this.notificationService.setupOnLaunch()
    this.nav.setRoot(NavigationService.nextOnboardingPage(response.json()))
  }

  loginFailure = (response: Response) => {
    if (response.status == 401) {
      this.controlError = {
        email: true,
        message: 'The email and password you entered did not match our records. Please try again.',
        password: true,
      }
    } else {
      this.controlError = { message: 'An error has occurred.' }
    }
  }

  forgotPassword() {
    this.nav.push(ForgottenPasswordPage)
  }

}
