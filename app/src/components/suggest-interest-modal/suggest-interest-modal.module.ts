import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SuggestInterestModalComponent } from './suggest-interest-modal';

@NgModule({
  declarations: [
    SuggestInterestModalComponent,
  ],
  imports: [
    IonicPageModule.forChild(SuggestInterestModalComponent),
  ],
  exports: [
    SuggestInterestModalComponent
  ]
})
export class SuggestInterestModalComponentModule {}
