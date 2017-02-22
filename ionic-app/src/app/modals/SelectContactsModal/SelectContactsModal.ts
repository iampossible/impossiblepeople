import {NavParams, ViewController} from 'ionic-angular/index';
import {Component} from '@angular/core';

@Component({
  templateUrl: 'build/modals/SelectContactsModal/SelectContactsModal.html',
})
export class SelectContactsModal {

  contacts:Array<any>

  contactsHolder:Array<any>
  ionViewLoaded = false
  private invitees

  constructor(private navParams:NavParams, private viewCtrl:ViewController) {
    this.contactsHolder = navParams.data.contacts
    this.invitees = {}
  }

  ionViewDidLoad() {
    this.contacts = this.contactsHolder
    this.ionViewLoaded = true
  }

  ionViewDidEnter() {
    if (!this.ionViewLoaded) {
      this.ionViewLoaded = true
      this.ionViewDidLoad()
    }
  }

  selectedContact(event, contact) {
    if (contact.email in this.invitees) {
      delete this.invitees[contact.email]
    } else {
      this.invitees[contact.email] = contact
    }
  }

  submitContacts = () => {
    this.viewCtrl.dismiss(Object.keys(this.invitees))
  }

  dismissModal = () => {
    this.viewCtrl.dismiss(null)
  }

}
