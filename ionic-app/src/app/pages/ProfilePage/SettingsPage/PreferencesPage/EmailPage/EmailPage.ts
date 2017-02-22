import {Events, AlertController, NavController, NavParams} from 'ionic-angular'
import {ControlGroup, FormBuilder, Validators} from '@angular/common'
import {Response} from '@angular/http'
import {Component} from '@angular/core'
import {Keyboard} from 'ionic-native'
import {KeyboardAttachDirective} from '../../../../../directives/keyboardAttach.directive'
import {UserService} from '../../../../../services/api/UserService'
import {Environment} from '../../../../../Environment'

declare const heap: any

@Component({
  templateUrl: 'build/pages/ProfilePage/SettingsPage/PreferencesPage/EmailPage/EmailPage.html',
  directives: [KeyboardAttachDirective]
})
export class EmailPage {
  private user: any
  private emailForm: ControlGroup

  constructor(private params: NavParams,
              private form: FormBuilder,
              private events: Events,
              private alertCtrl: AlertController,
              private userService: UserService,
              private nav: NavController) {
    this.user = params.data
    this.emailForm = form.group({
      email: ['', Validators.required],
    })
  }

  saveEmail(event) {
    if (this.emailForm.valid) {
      let userUpdate = { email: this.emailForm.value.email }
      this.userService.updateUser(userUpdate).subscribe((response: Response) => {
        if (Environment.HEAP && 'heap' in window) {
          heap.track('CHANGE_EMAIL')
        }
        this.events.publish('user:updated', response.json())
        this.nav.pop()
      }, (response: Response) => {
        let failAlert = this.alertCtrl.create({
          title: 'Oops!',
          subTitle: `Something went wrong: ${JSON.stringify(response.json())}`,
          buttons: ['OK']
        })
        failAlert.present()
      })
    }
  }

  onPageWillEnter() {
    Keyboard.disableScroll(true)
  }

  onPageWillLeave() {
    Keyboard.disableScroll(false)
  }
}
