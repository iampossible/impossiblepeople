import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InterestsPage } from './interests';

@NgModule({
  declarations: [
    InterestsPage,
  ],
  imports: [
    IonicPageModule.forChild(InterestsPage),
  ],
  exports: [
    InterestsPage
  ]
})
export class InterestsPageModule {}
