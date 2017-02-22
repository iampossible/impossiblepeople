import {Component} from '@angular/core';
import {Icon, Events} from 'ionic-angular';

@Component({
  templateUrl: 'build/components/QuickFeedback/QuickFeedback.html',
  selector: 'quick-feedback',
  directives: [Icon],
})
export class QuickFeedback {
  private isVisible: boolean = false
  private notification: NotificationOptions
  private toggleTimeout: any
  private durationTimeout: number = 1500

  constructor(private events: Events) {
    events.subscribe('feedback:show', this.show)
  }

  show = (evOptions: Array<NotificationOptions>) => {
    if (evOptions.length === 0) return;

    this.isVisible = true
    this.notification = evOptions.pop()

    clearTimeout(this.toggleTimeout)
    this.toggleTimeout = setTimeout(this.hide, this.durationTimeout)
  }

  hide = () => {
    this.isVisible = false
  }

}

interface NotificationOptions {
  msg: string
  icon: string
}
