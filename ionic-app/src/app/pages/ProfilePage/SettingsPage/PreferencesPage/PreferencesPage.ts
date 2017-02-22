import {Events, ActionSheetController, ActionSheet} from 'ionic-angular'
import {NavController, NavParams} from 'ionic-angular/index'
import {Component} from '@angular/core'
import {Facebook} from 'ionic-native'
import {EmailPage} from './EmailPage/EmailPage'
import {PrivacyPolicyPage} from './PrivacyPolicyPage/PrivacyPolicyPage'
import {AuthService} from '../../../../services/api/ApiService'
import {TermsConditionsPage} from './TermsConditionsPage/TermsConditionsPage'
import {Environment} from '../../../../Environment'

declare var heap: any
@Component({
  templateUrl: 'build/pages/ProfilePage/SettingsPage/PreferencesPage/PreferencesPage.html',
})
export class PreferencesPage {
  private user
  private version: string
  logoutOptions:ActionSheet

  constructor(private nav: NavController,
              private params: NavParams,
              private events: Events,
              private actionSheetCtrl: ActionSheetController,
              private authService: AuthService) {
    this.user = params.data
    this.version = Environment.version
    this.events.subscribe('user:updated', (dataArray) => {
      let updated = dataArray[0]
      if (updated) {
        this.user = Object.assign(this.user, updated)
      }
    })
  }

  changeEmail() {
    this.nav.push(EmailPage, this.user)
  }

  privacyPolicy() {
    this.nav.push(PrivacyPolicyPage)
  }

  termsConditions() {
    this.nav.push(TermsConditionsPage)
  }

  _doLogout(reason?: any): void {
    setTimeout(() => {
      window.location.href = window.location.href.split('#').shift()
    }, 333)
  }

  logOut() {
    this.logoutOptions = this.actionSheetCtrl.create({
      buttons: [
        {
          handler: () => {
            this.logoutOptions.dismiss()
            this.authService.logOut().subscribe(() => {
              if (Environment.HEAP && 'heap' in window) {
                heap.track('LOGOUT')
              }
              if (this.user.fromFacebook) {
                Facebook.logout().then(this._doLogout).catch(this._doLogout)
              } else {
                this._doLogout()
              }
            })
          },
          role: 'destructive',
          text: 'Log out'
        },
        { role: 'cancel', text: 'Cancel' },
      ],
    })
    this.logoutOptions.present()
  }
}
