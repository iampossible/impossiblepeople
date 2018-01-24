import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NearMePage } from './near-me';

@NgModule({
  declarations: [
    NearMePage,
  ],
  imports: [
    IonicPageModule.forChild(NearMePage),
  ],
  exports: [
    NearMePage
  ]
})
export class NearMePageModule {}
