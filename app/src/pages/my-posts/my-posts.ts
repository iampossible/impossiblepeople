import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, Events } from 'ionic-angular';
import { UserService } from '../../providers/user-service/user-service';
import {Response} from '@angular/http';

//@IonicPage()
@Component({
  selector: 'page-my-posts',
  templateUrl: 'my-posts.html',
})
export class MyPostsPage {

  posts: Array<any>;

  constructor(private nav: NavController,
              private userService: UserService,
              private alertCtrl: AlertController,
              private events: Events) {
    this.fetch();

    this.events.subscribe('user:posts:updated', () => {
      this.fetch();
    });
  }

  fetch() {
    this.userService.getCurrentUserPosts().subscribe(
      (response: Response) => {
        this.posts = response.json().posts;
      },
      () => {
        let failAlert = this.alertCtrl.create({
          title: 'Oops!',
          subTitle: 'Failed to fetch your posts',
          buttons: ['OK']
        });
        failAlert.present();
      });
  }
}
