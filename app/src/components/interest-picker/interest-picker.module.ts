import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InterestPickerComponent } from './interest-picker';

@NgModule({
  declarations: [
    InterestPickerComponent,
  ],
  imports: [
    IonicPageModule.forChild(InterestPickerComponent),
  ],
  exports: [
    InterestPickerComponent
  ]
})
export class InterestPickerComponentModule {}
