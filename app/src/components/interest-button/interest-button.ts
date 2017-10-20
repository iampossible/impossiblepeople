import { Component, Input } from '@angular/core';

@Component({
  selector: 'interest-button',
  templateUrl: 'interest-button.html'
})
export class InterestButtonComponent {
  @Input() interest;

  constructor() {
  }
}
