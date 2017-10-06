import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SuggestInterestModalPage } from './suggest-interest-modal';

@NgModule({
  declarations: [
    SuggestInterestModalPage,
  ],
  imports: [
    IonicPageModule.forChild(SuggestInterestModalPage),
  ],
  exports: [
    SuggestInterestModalPage
  ]
})
export class SuggestInterestModalPageModule {}
