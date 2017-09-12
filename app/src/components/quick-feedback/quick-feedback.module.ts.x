import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QuickFeedbackComponent } from './quick-feedback';

@NgModule({
  declarations: [
    QuickFeedbackComponent,
  ],
  imports: [
    IonicPageModule.forChild(QuickFeedbackComponent),
  ],
  exports: [
    QuickFeedbackComponent
  ]
})
export class QuickFeedbackComponentModule {}
