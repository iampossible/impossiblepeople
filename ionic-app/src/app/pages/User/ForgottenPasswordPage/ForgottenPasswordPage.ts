import {ControlGroup, FormBuilder} from '@angular/common'
import {NavController, Events} from 'ionic-angular'
import {AuthService} from '../../../services/api/ApiService'
import {Component} from '@angular/core'
import {Response} from '@angular/http'
import {LandingPage} from '../../../pages/Pages';

@Component({
  templateUrl: 'build/pages/User/ForgottenPasswordPage/ForgottenPasswordPage.html',
})
export class ForgottenPasswordPage {
  private recoverPasswordForm: ControlGroup
  private controlError

  constructor(private nav: NavController,
              private authService: AuthService,
              private form: FormBuilder,
              private events: Events) {
    this.recoverPasswordForm = form.group({
      email: [''],
    })
    this.controlError = {}
  }

  recoverPassword(event) {
    this.authService
      .recoverPassword(this.recoverPasswordForm.value.email)
      .subscribe(this.recoverSuccess, this.recoverFailure);
  }

  recoverSuccess = (response: Response) => {
    if (response.status > 202) {
      return this.recoverFailure(response)
    }
    this.events.publish('feedback:show', { msg: 'Success!', icon: 'checkmark' })
    this.nav.setRoot(LandingPage)
  }

  recoverFailure = (response: Response) => {
    if (response.status == 404) {
      this.controlError = {
        email: true,
        message: 'Please make sure you have entered the correct email address.',
      }
    } else if (response.status == 422) {
      this.controlError = {
        email: true,
        message: 'Please sign in using Facebook. As a Facebook user, you don\'t need to reset your password using this service.',
      }
    } else {
      this.controlError = { message: 'An error has occurred.' }
    }
  }
}
