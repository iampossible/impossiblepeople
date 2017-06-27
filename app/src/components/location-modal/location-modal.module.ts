import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LocationModalComponent } from './location-modal';

@NgModule({
  declarations: [
    LocationModalComponent,
  ],
  imports: [
    IonicPageModule.forChild(LocationModalComponent),
  ],
  exports: [
    LocationModalComponent
  ]
})
export class LocationModalComponentModule {}
