import { Component } from '@angular/core';
import { Events } from 'ionic-angular';

@Component({
  selector: 'quick-feedback',
  templateUrl: 'quick-feedback.html'
})
export class QuickFeedbackComponent {

  private isVisible: boolean = false;
  private notification: NotificationOptions;
  private toggleTimeout: any;
  private durationTimeout: number = 1500;

  constructor(private events: Events) {
    events.subscribe('feedback:show', this.show);
  }

  show = (evOptions: NotificationOptions) => {
    console.log('cenas', evOptions);
    this.isVisible = true;
    this.notification = evOptions;

    clearTimeout(this.toggleTimeout);
    this.toggleTimeout = setTimeout(this.hide, this.durationTimeout);
  }

  hide = () => {
    this.isVisible = false;
  }
}

interface NotificationOptions {
  msg: string;
  icon: string;
}
