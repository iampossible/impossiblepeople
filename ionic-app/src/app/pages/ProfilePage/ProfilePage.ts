import {NavParams, NavController, AlertController, Events, ActionSheet, ActionSheetController} from 'ionic-angular'
import {ProfileService} from '../../services/api/ApiService'
import {Response} from '@angular/http'
import {Component} from '@angular/core'
import {PostCard} from '../../components/Components'
import {SettingsPage} from './SettingsPage/SettingsPage'
import {Environment} from '../../Environment'
import {InAppBrowser} from 'ionic-native'

declare const heap: any

@Component({
  templateUrl: 'build/pages/ProfilePage/ProfilePage.html',
  directives: [PostCard]
})
export class ProfilePage {

  private user: any = {}
  private viewing: string
  private myProfile: boolean = false
  private actionSheet: ActionSheet

  constructor(private navParams: NavParams,
              private nav: NavController,
              private events: Events,
              private alertCtrl: AlertController,
              private actionSheetCtrl: ActionSheetController,
              private profileService: ProfileService) {

    this.viewing = this.navParams.get('userID')
    let current = localStorage.getItem('USER_ID')
    if (!this.viewing) {
      this.viewing = current
    }
    this.myProfile = (this.viewing === current)
    this.loadProfileData()

    this.events.subscribe('user:posts:updated', (post) => {
      if (this.user.userID !== post[0].author.userID) {
        return;
      }

      this.loadProfileData()
    })

    events.subscribe('user:updated', (dataArray) => {
      if (this.user.userID !== this.viewing) {
        return;
      }

      let updated = dataArray[0]
      if (updated) {
        this.user = Object.assign(this.user, updated)
      } else {
        this.loadProfileData()
      }
    })
  }

  private onLoadError() {
    this.nav.pop().then(() => {
      let loadErrorAlert = this.alertCtrl.create({
        title: 'Could not load profile data',
        subTitle: '',
        buttons: ['OK']
      })
      loadErrorAlert.present()
    })
  }

  private loadProfileData() {
    this.profileService
      .getProfile(this.viewing)
      .subscribe((response: Response) => {
        this.user = response.json();
      }, () => this.onLoadError())
  }

  openProfileWeblink() {
    if (this.user.url) {
      new InAppBrowser(this.user.url, '_system')
    }
  }

  private openSettings() {
    this.nav.push(SettingsPage)
  }

  private openPublicSettings() {
    event.stopPropagation()
    this.actionSheet = this.actionSheetCtrl.create({
      title: 'Profile actions',
      buttons: [
        {
          text: 'Block User',
          role: 'destructive',
          handler: () => {
            this.actionSheet.dismiss()
            this.blockUser();
          }
        }
        , {
          text: 'Report User',
          role: 'destructive',
          handler: () => {
            this.actionSheet.dismiss()
            this.reportUser();
          }
        }, {
          text: 'Cancel',
          role: 'cancel',
        }
      ]
    })

    this.actionSheet.present()
  }

  private setFollowing() {
    if (this.user.following) {
      this.profileService.unfollow(this.user.userID).subscribe(() => {
        if (Environment.HEAP && 'heap' in window) {
          heap.track('UNFOLLOW', { userID: this.user.userID })
        }
        this.user.following = !this.user.following
      }, (error) => {
        let errorAlert = this.alertCtrl.create({
          title: 'Oops!',
          subTitle: 'Something went wrong',
          buttons: ['OK']
        })
        errorAlert.present()
      })
    } else {
      this.profileService.follow(this.user.userID).subscribe(() => {
        if (Environment.HEAP && 'heap' in window) {
          heap.track('FOLLOW', { userID: this.user.userID })
        }
        this.user.following = !this.user.following
      }, (error) => {
        let errorAlert = this.alertCtrl.create({
          title: 'Oops!',
          subTitle: 'Something went wrong',
          buttons: ['OK']
        })
        errorAlert.present()
      })
    }
  }

  private blockUser() {
    this.profileService.block(this.user.userID).subscribe(() => this.onBlockUser(), () => this.onLoadError())
  }

  private onBlockUser() {
    this.nav.pop()
      .then(() => {
        this.events.publish('feedback:show', {
          msg: 'User blocked. You will no longer see each others content.',
          icon: 'checkmark'
        })
      })
  }

  private reportUser() {
    this.profileService.report(this.user.userID).subscribe(() => {
      this.events.publish('feedback:show', {
        msg: `Thank you! We will review this user’s account shortly.`,
        icon: 'checkmark'
      })
    }, (error) => {
      let errorAlert = this.alertCtrl.create({
        title: 'Oops!',
        subTitle: 'Something went wrong',
        buttons: ['OK']
      })
      errorAlert.present()
    })
  }
}
