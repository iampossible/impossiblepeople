import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InterestButtonComponent } from './interest-button';

@NgModule({
  declarations: [
    InterestButtonComponent,
  ],
  imports: [
    IonicPageModule.forChild(InterestButtonComponent),
  ],
  exports: [
    InterestButtonComponent
  ]
})
export class InterestButtonComponentModule {}
