import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectContactsModalPage } from './select-contacts-modal';

@NgModule({
  declarations: [
    SelectContactsModalPage,
  ],
  imports: [
    IonicPageModule.forChild(SelectContactsModalPage),
  ],
  exports: [
    SelectContactsModalPage
  ]
})
export class SelectContactsModalPageModule {}
