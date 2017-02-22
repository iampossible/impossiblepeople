import {Component} from '@angular/core'
import {NavController} from 'ionic-angular/index'
import {Contacts, SocialSharing} from 'ionic-native'



@Component({
  templateUrl: 'build/pages/ProfilePage/SettingsPage/InviteFriendsPage/InviteFriendsPage.html',
})
export class InviteFriendsPage {

  constructor(private nav: NavController) {
  }

  accessContacts() {
    Contacts.pickContact()
  }

  shareLink() {
    SocialSharing.share('Hello, world')
  }
}
