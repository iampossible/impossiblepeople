import { Component, EventEmitter, Output, Input } from '@angular/core';
import { Contacts } from '@ionic-native/contacts';

@Component({
  selector: 'invite-contacts',
  templateUrl: 'invite-contacts.html'
})
export class InviteContactsComponent {

  @Input() buttonText: string;

  @Output() onConnect = new EventEmitter();
  @Output() onError = new EventEmitter();

  constructor(private contacts: Contacts) { }

  accessContacts = () => {
    this.contacts
      .find(['emails'], { desiredFields: ['emails', 'name'], multiple: true, filter: '@' })
      .then((contacts) => {
        this.onInviteOk(this.getEmailList(contacts));
      })
      .catch(this.onInviteError);
  }

  private getEmailList = (contacts) => {
    return contacts
      .filter(item => {
        return item && item.emails && item.emails.length > 0;
      })
      .map(contact => {
        let email = '', name = '';
        if (contact.emails && Array.isArray(contact.emails)) {
          let homeEmails = contact.emails.filter(email => email.type === 'home');
          if (homeEmails.length > 0) {
            email = homeEmails[0].value;
          } else if (contact.emails.length > 0) {
            email = contact.emails[0].value;
          }
        }

        try {
          name = contact.name.formatted || email;
        } catch (e) {
          name = email;
        }

        return { name, email };
      }).sort((a, b) => {
        if (!a.name) return 1;
        if (!b.name) return -1;
        let nameA = a.name.toLowerCase();
        let nameB = b.name.toLowerCase() || '';
        return nameA === nameB ? 0 : nameA < nameB ? -1 : 1;
      });
  }

  private onInviteOk = (contacts) => {
    this.onConnect.emit(contacts);
  }

  private throwErrorMsg(msg: string) {
    this.onError.emit(msg);
  }

  private onInviteError = (msg) => {
    console.error('onInviteError', msg);
    this.throwErrorMsg(msg);
  }

}
