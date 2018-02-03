import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

// @IonicPage()
@Component({
  selector: 'page-select-contacts-modal',
  templateUrl: 'select-contacts-modal.html',
})
export class SelectContactsModalPage {
  contacts: Array<any>;

  contactsHolder: Array<any>;
  private invitees;

  constructor(private navParams: NavParams, private viewCtrl: ViewController) {
    this.contactsHolder = this.navParams.data.contacts;
    this.invitees = {};
  }

  ionViewWillEnter() {
    if (!this.contacts || this.contacts.length === 0) {
      this.contacts = this.contactsHolder;
    }
  }

  selectedContact(event, contact) {
    if (contact.email in this.invitees) {
      delete this.invitees[contact.email];
    } else {
      this.invitees[contact.email] = contact;
    }
  }

  submitContacts = () => {
    this.viewCtrl.dismiss(Object.keys(this.invitees));
  }

  dismissModal = () => {
    this.viewCtrl.dismiss(null);
  }


}
