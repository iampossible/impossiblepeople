import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddLocationModalPage } from './add-location-modal';

@NgModule({
  declarations: [
    AddLocationModalPage,
  ],
  imports: [
    IonicPageModule.forChild(AddLocationModalPage),
  ],
  exports: [
    AddLocationModalPage
  ]
})
export class AddLocationModalPageModule {}
