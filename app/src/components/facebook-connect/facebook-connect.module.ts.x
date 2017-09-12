import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FacebookConnectComponent } from './facebook-connect';

@NgModule({
  declarations: [
    FacebookConnectComponent,
  ],
  imports: [
    IonicPageModule.forChild(FacebookConnectComponent),
  ],
  exports: [
    FacebookConnectComponent
  ]
})
export class FacebookConnectComponentModule {}
