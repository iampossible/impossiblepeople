import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PostCardComponent } from './post-card';

@NgModule({
  declarations: [
    PostCardComponent,
  ],
  imports: [
    IonicPageModule.forChild(PostCardComponent),
  ],
  exports: [
    PostCardComponent
  ]
})
export class PostCardComponentModule {}
