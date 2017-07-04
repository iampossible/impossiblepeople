import { Component } from '@angular/core';

/**
 * Generated class for the LocationModalComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'location-modal',
  templateUrl: 'location-modal.html'
})
export class LocationModalComponent {

  text: string;

  constructor() {
    console.log('Hello LocationModalComponent Component');
    this.text = 'Hello World';
  }

}
