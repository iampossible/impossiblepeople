import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { Contacts } from '@ionic-native/contacts';
import { SocialSharing } from '@ionic-native/social-sharing';

//@IonicPage()
@Component({
  selector: 'page-invite-friends',
  templateUrl: 'invite-friends.html',
})
export class InviteFriendsPage {

  constructor(
    private contacts: Contacts,
    private socialSharing: SocialSharing) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InviteFriendsPage');
  }

  accessContacts() {
    this.contacts.pickContact();
  }

  shareLink() {
    this.socialSharing.share('Hello, world');
  }

}
