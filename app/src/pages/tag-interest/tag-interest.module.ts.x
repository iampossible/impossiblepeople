import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TagInterestPage } from './tag-interest';

@NgModule({
  declarations: [
    TagInterestPage,
  ],
  imports: [
    IonicPageModule.forChild(TagInterestPage),
  ],
  exports: [
    TagInterestPage
  ]
})
export class TagInterestPageModule {}
