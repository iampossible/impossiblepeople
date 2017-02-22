import {
  Events,
  NavController,
  ModalController,
  AlertController
} from 'ionic-angular'
import {Component} from '@angular/core'
import {Response} from '@angular/http'
import {UserService} from '../../../services/api/ApiService'
import {EditProfileModal} from './EditProfileModal/EditProfileModal'
import {InterestsPage} from '../../Pages'
import {MyPostsPage} from './MyPostsPage/MyPostsPage'
import {InviteFriendsPage} from './InviteFriendsPage/InviteFriendsPage'
import {FindFriendsPage} from './FindFriendsPage/FindFriendsPage'
import {MyFriendsPage} from './MyFriendsPage/MyFriendsPage'
import {PreferencesPage} from './PreferencesPage/PreferencesPage'

@Component({
  templateUrl: 'build/pages/ProfilePage/SettingsPage/SettingsPage.html',
})
export class SettingsPage {
  private user: any = {
    interests: [],
    posts: [],
  }

  constructor(private nav: NavController,
              private modalCtrl: ModalController,
              private alertCtrl: AlertController,
              private userService: UserService,
              private events: Events) {
    events.subscribe('user:updated', (dataArray) => {
      let updated = dataArray[0]
      if (updated) {
        this.user = Object.assign(this.user, updated)
      } else {
        this.getUserDetails()
      }
    });
  }

  onPageWillEnter() {
    this.getUserDetails()
  }

  editInterests() {
    this.nav.push(InterestsPage, { editMode: true })
  }

  editProfile() {
    this.modalCtrl.create(EditProfileModal, this.user).present()
  }

  viewPosts() {
    this.nav.push(MyPostsPage)
  }

  getUserDetails() {
    this.userService
      .getCurrentUser()
      .subscribe(
        (response: Response) => this.user = response.json(),
        () => {
          let failAlert = this.alertCtrl.create({
            title: 'Oops!',
            subTitle: 'Failed to fetch user details',
            buttons: ['OK']
          })
          failAlert.present()
        })
  }

  inviteFriends() {
    this.nav.push(InviteFriendsPage)
  }

  viewFriends() {
    this.nav.push(MyFriendsPage, { friendsList: this.user.friends })
  }

  editSettings() {
    this.nav.push(PreferencesPage, this.user)
  }

  findFriends() {
    this.nav.push(FindFriendsPage)
  }
}
