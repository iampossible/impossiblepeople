import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Push, PushObject, PushOptions } from '@ionic-native/push';

import { UserService } from '../user-service/user-service';
import { Environment } from '../../Environment';

import 'rxjs/add/operator/map';

@Injectable()
export class NotificationService {

  private pushNotification: PushObject;

  constructor(private events: Events,
    private userService: UserService,
    private push: Push) { }

  register() {
    try {
      const opt: PushOptions = {
        ios: { alert: 'true', badge: true, sound: 'true' },
        android: { senderID: Environment.SENDERID }
      };
      this.pushNotification = this.push.init(opt);


      this.pushNotification
        .on('notification')
        .subscribe((data) => {
          this.events.publish('notifications:receive', data);
        }, console.error);

      this.pushNotification
        .on('registration')
        .subscribe((data) => {
          this.events.publish('notifications:register', data);
        }, console.error);

      this.pushNotification
        .on('error')
        .subscribe((err) => {
          console.warn('failed to initialise notifications', err.message);
        }, console.error);

    } catch (err) {
      console.warn('failed to initialise notifications', err);
    }
  }

  unregister() {
    if (this.pushNotification) {
      this.pushNotification.unregister()
        .catch(err => console.warn('failed to unregister notifications', err));
    }
  }

  setupOnLaunch() {
    // console.log('setupOnLaunch');
    this.userService.getCurrentUserPosts().subscribe((data) => {
      // console.log('setupOnLaunch', 'this.userService.getCurrentUserPosts()', data.json());
      if (data.json().posts.length > 0) {
        this.register();
      }
    }, console.log);
  }
}
