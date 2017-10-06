import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditProfileModalPage } from './edit-profile-modal';

@NgModule({
  declarations: [
    EditProfileModalPage,
  ],
  imports: [
    IonicPageModule.forChild(EditProfileModalPage),
  ],
  exports: [
    EditProfileModalPage
  ]
})
export class EditProfileModalPageModule {}
