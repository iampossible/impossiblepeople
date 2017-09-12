import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyPostsPage } from './my-posts';

@NgModule({
  declarations: [
    MyPostsPage,
  ],
  imports: [
    IonicPageModule.forChild(MyPostsPage),
  ],
  exports: [
    MyPostsPage
  ]
})
export class MyPostsPageModule {}
