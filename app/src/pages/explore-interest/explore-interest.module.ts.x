import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ExploreInterestPage } from './explore-interest';

@NgModule({
  declarations: [
    ExploreInterestPage,
  ],
  imports: [
    IonicPageModule.forChild(ExploreInterestPage),
  ],
  exports: [
    ExploreInterestPage
  ]
})
export class ExploreInterestPageModule {}
