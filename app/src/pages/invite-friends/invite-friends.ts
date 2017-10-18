import { Component } from '@angular/core';
import { Contacts } from '@ionic-native/contacts';
import { SocialSharing } from '@ionic-native/social-sharing';

// @IonicPage()
@Component({
  selector: 'page-invite-friends',
  templateUrl: 'invite-friends.html',
})
export class InviteFriendsPage {

  constructor(
    private contacts: Contacts,
    private socialSharing: SocialSharing) {
  }

  accessContacts() {
    this.contacts.pickContact();
  }

  shareLink() {
    this.socialSharing.share('Hello, world');
  }

}
