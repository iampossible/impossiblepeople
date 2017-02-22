import {Events} from 'ionic-angular'
import {AlertController, NavController} from 'ionic-angular/index'
import {Component} from '@angular/core'
import {Response} from '@angular/http'

import {PostCard} from '../../../../components/PostCard/PostCard'
import {UserService} from '../../../../services/api/ApiService'

@Component({
  templateUrl: 'build/pages/ProfilePage/SettingsPage/MyPostsPage/MyPostsPage.html',
  directives: [PostCard]
})
export class MyPostsPage {
  posts: Array<any>

  constructor(private nav: NavController,
              private userService: UserService,
              private alertCtrl: AlertController,
              private events: Events) {
    this.fetch()

    this.events.subscribe('user:posts:updated', () => {
      this.fetch()
    })
  }

  fetch() {
    this.userService.getCurrentUserPosts().subscribe(
      (response: Response) => {
        this.posts = response.json().posts
      },
      () => {
        let failAlert = this.alertCtrl.create({
          title: 'Oops!',
          subTitle: 'Failed to fetch your posts',
          buttons: ['OK']
        })
        failAlert.present()
      })
  }
}
