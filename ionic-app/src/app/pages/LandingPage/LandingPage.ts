import {NavController, AlertController} from 'ionic-angular'
import {Component} from '@angular/core'
import {Response} from '@angular/http'
import {AuthPage, SignUpPage, MainPage} from '../Pages'
import {FacebookConnect} from '../../components/FacebookConnect/FacebookConnect'
import {FacebookService, ApiService} from '../../services/api/ApiService'
import {NavigationService} from '../../services/navigation/NavigationService'
import {Environment} from '../../Environment'
import {NotificationService} from '../../services/NotificationService'
import 'rxjs/Rx'

declare const heap: any

@Component({
  templateUrl: 'build/pages/LandingPage/LandingPage.html',
  directives: [FacebookConnect]
})
export class LandingPage {
  public Title: string

  public slideOptions = {
    initialSlide: 0,
    loop: true,
    pager: true,
    autoplay: 5000,
    speed: 700
  }

  constructor(private nav: NavController,
              private facebookService: FacebookService,
              private alertCtrl: AlertController,
              private notificationService: NotificationService) {
  }

  goToAuthPage(event) {
    this.nav.push(AuthPage)
  }

  goToSignUpPage(event) {
    this.nav.push(SignUpPage)
  }

  fbConnect(auth) {
    //noinspection TypeScriptUnresolvedVariable
    this.facebookService.checkToken(auth.authResponse.accessToken)
      .subscribe(
        (response: Response) => {
          ApiService.extractID(response)
          if (response.status == 200 || response.status == 201) {
            if (Environment.HEAP && 'heap' in window) {
              heap.track('LOGIN_FACEBOOK')
            }
            this.notificationService.setupOnLaunch()
            this.nav.setRoot(NavigationService.nextOnboardingPage(response.json()))
          } else if (response.status == 403) {

            let oppsAlert = this.alertCtrl.create({
              title: 'Not a Facebook user',
              subTitle: 'Please log in using your email address and password',
              buttons: ['OK']
            })

            oppsAlert.present()
          } else {
            let oppsAlert = this.alertCtrl.create({
              title: 'Oops!',
              subTitle: 'Something went wrong: ' + JSON.stringify(response.json()),
              buttons: ['OK']
            })

            oppsAlert.present()
          }
        })
  }

  fbError(error) {
    console.error(error)
  }
}
