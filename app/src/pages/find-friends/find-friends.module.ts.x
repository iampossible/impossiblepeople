import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FindFriendsPage } from './find-friends';

@NgModule({
  declarations: [
    FindFriendsPage,
  ],
  imports: [
    IonicPageModule.forChild(FindFriendsPage),
  ],
  exports: [
    FindFriendsPage
  ]
})
export class FindFriendsPageModule {}
