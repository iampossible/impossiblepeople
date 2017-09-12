import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ForgottenPasswordPage } from './forgotten-password';

@NgModule({
  declarations: [
    ForgottenPasswordPage,
  ],
  imports: [
    IonicPageModule.forChild(ForgottenPasswordPage),
  ],
  exports: [
    ForgottenPasswordPage
  ]
})
export class ForgottenPasswordPageModule {}
