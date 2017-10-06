import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InviteContactsComponent } from './invite-contacts';

@NgModule({
  declarations: [
    InviteContactsComponent,
  ],
  imports: [
    IonicPageModule.forChild(InviteContactsComponent),
  ],
  exports: [
    InviteContactsComponent
  ]
})
export class InviteContactsComponentModule {}
