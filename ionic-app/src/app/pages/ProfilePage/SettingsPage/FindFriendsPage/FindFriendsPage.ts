import {Response} from '@angular/http'
import {Component} from '@angular/core'
import {Alert, AlertController, Events, ModalController} from 'ionic-angular'
import {NavController} from 'ionic-angular/index'
import {FacebookConnect, InviteContacts} from '../../../../components/Components'
import {FacebookService} from '../../../../services/api/FacebookService'
import {SelectContactsModal} from '../../../../modals/Modals'
import {AuthService} from '../../../../services/api/AuthService'
import {Environment} from '../../../../Environment'

declare const heap: any

@Component({
  templateUrl: 'build/pages/ProfilePage/SettingsPage/FindFriendsPage/FindFriendsPage.html',
  directives: [FacebookConnect, InviteContacts]
})
export class FindFriendsPage {
  alreadyLinked: Alert

  constructor(private nav: NavController,
              private facebookService: FacebookService,
              private events: Events,
              private alertCtrl: AlertController,
              private modalCtrl: ModalController,
              private authService: AuthService) {
    this.alreadyLinked = this.alertCtrl.create({
      title: 'Account already linked',
      subTitle: 'Another user is already linked to that Facebook account. Please double-check your Facebook credentials.',
      buttons: ['OK'],
    })
  }

  inviteSuccess(contacts) {
    let modal = this.modalCtrl.create(SelectContactsModal, { contacts })
    modal.onDidDismiss((contacts) => {
      this.authService.inviteContacts(contacts).subscribe(
        (response: Response) => {
          if (Environment.HEAP && 'heap' in window) {
            heap.track('FRIEND_INVITE_SENT')
          }
          this.events.publish('feedback:show', { msg: 'Success!', icon: 'checkmark' })
          this.nav.parent.select(0)
        },
        (response: Response) => {
          let failAlert = this.alertCtrl.create({
            title: 'Oops!',
            subTitle: 'Something went wrong [' + response.status + ']: ' + JSON.stringify(response.json()),
            buttons: ['OK']
          })
          failAlert.present()
        }
      )
    })
    modal.present()
  }

  inviteError() {
    let failAlert = this.alertCtrl.create({
      title: 'Oops!',
      subTitle: 'Unable to invite friends',
      buttons: ['OK']
    })
    failAlert.present()
  }

  fbConnect(auth) {
    //noinspection TypeScriptUnresolvedVariable
    this.facebookService.findFriends(auth.authResponse.accessToken)
      .subscribe(
        (response: Response) => {
          if (200 <= response.status && response.status <= 204) {
            if (Environment.HEAP && 'heap' in window) {
              heap.track('FRIEND_INVITE_FACEBOOK')
            }
            this.events.publish('feedback:show', { msg: 'Success!', icon: 'checkmark' })
            this.nav.parent.select(0)
          } else if (response.status == 422) {
            // TODO which side does this actually happen?
            this.alreadyLinked.present()
          } else {
            let failAlert = this.alertCtrl.create({
              title: 'Oops!',
              subTitle: 'Something went wrong [' + response.status + ']: ' + JSON.stringify(response.json()),
              buttons: ['OK']
            })
            failAlert.present()
          }
        },
        (response: Response) => {
          if (response.status == 422) {
            // TODO which side does this actually happen?
            this.alreadyLinked.present()
          } else {
            let failAlert = this.alertCtrl.create({
              title: 'Oops!',
              subTitle: 'Something went wrong [' + response.status + ']: ' + JSON.stringify(response.json()),
              buttons: ['OK']
            })
          }
        }
      )
  }

  fbError(error) {
    console.error(error)
  }
}
