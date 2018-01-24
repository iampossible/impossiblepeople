import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ProfilePage } from '../profile/profile';
import { Environment } from '../../Environment';
import { ProfileService } from '../../providers/profile-service/profile-service';

declare const heap: any;

// @IonicPage()
@Component({
  selector: 'page-my-friends',
  templateUrl: 'my-friends.html',
})
export class MyFriendsPage {
  private friendsList: Array<any>;

  constructor(
    private navParams: NavParams,
    private nav: NavController,
    private profileService: ProfileService) {
    this.friendsList = this.navParams.get('friendsList');
  }

  public followToggle(user: any) {
    // NOTE: updates UI immediately, then reverts the change in failing cases
    if (user.unfollowed) {
      this.profileService.follow(user.userID).subscribe(() => { }, () => this.toggleFriendship(user));
      if (Environment.HEAP && 'heap' in window) {
        heap.track('FOLLOW', { userID: user.userID });
      }
    } else {
      this.profileService.unfollow(user.userID).subscribe(() => { }, () => this.toggleFriendship(user));
      if (Environment.HEAP && 'heap' in window) {
        heap.track('UNFOLLOW', { userID: user.userID });
      }
    }
    this.toggleFriendship(user);
  }

  private toggleFriendship(user: any) {
    user.unfollowed = !user.unfollowed;
  }

  goToProfile(userID) {
    this.nav.push(ProfilePage, { userID: userID });
  }
}
