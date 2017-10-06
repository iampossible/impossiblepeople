import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyFriendsPage } from './my-friends';

@NgModule({
  declarations: [
    MyFriendsPage,
  ],
  imports: [
    IonicPageModule.forChild(MyFriendsPage),
  ],
  exports: [
    MyFriendsPage
  ]
})
export class MyFriendsPageModule {}
