import {NavParams, NavController} from 'ionic-angular'
import {ProfileService} from '../../../../services/api/ApiService'
import {Component} from '@angular/core';
import {ProfilePage} from '../../ProfilePage';
import {Environment} from '../../../../Environment'

declare const heap: any

@Component({
  templateUrl: 'build/pages/ProfilePage/SettingsPage/MyFriendsPage/MyFriendsPage.html',
})
export class MyFriendsPage {

  private friendsList: Array<any>

  constructor(private navParams: NavParams, private nav: NavController, private profileService: ProfileService) {
    this.friendsList = navParams.get('friendsList')
  }

  public followToggle(user: any) {
    // NOTE: updates UI immediately, then reverts the change in failing cases
    if (user.unfollowed) {
      this.profileService.follow(user.userID).subscribe(() => {}, () => this.toggleFriendship(user))
      if (Environment.HEAP && 'heap' in window) {
        heap.track('FOLLOW', { userID: user.userID })
      }
    } else {
      this.profileService.unfollow(user.userID).subscribe(() => {}, () => this.toggleFriendship(user))
      if (Environment.HEAP && 'heap' in window) {
        heap.track('UNFOLLOW', { userID: user.userID })
      }
    }
    this.toggleFriendship(user);
  }

  private toggleFriendship(user: any) {
    user.unfollowed = !user.unfollowed
  }

  private goToProfile(userID) {
    this.nav.push(ProfilePage, { userID: userID })
  }

}
