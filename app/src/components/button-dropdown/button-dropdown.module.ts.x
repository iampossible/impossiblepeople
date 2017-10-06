import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ButtonDropdownComponent } from './button-dropdown';

@NgModule({
  declarations: [
    ButtonDropdownComponent,
  ],
  imports: [
    IonicPageModule.forChild(ButtonDropdownComponent),
  ],
  exports: [
    ButtonDropdownComponent
  ]
})
export class ButtonDropdownComponentModule {}
