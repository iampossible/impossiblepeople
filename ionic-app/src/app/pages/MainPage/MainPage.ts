import {NavController} from 'ionic-angular/index'
import {FeedTab, CreatePostTab, ActivityTab} from './Tabs'
import {ProfilePage} from '../ProfilePage/ProfilePage'
import {Events, Tabs} from 'ionic-angular'
import {Component, ChangeDetectorRef, ViewChild} from '@angular/core'
import {Badge} from 'ionic-native'

@Component({
  templateUrl: 'build/pages/MainPage/MainPage.html',
})
export class MainPage {
  public feedTab
  public createPostTab
  public activityTab
  public profilePageTab
  public activityCount: number = 0
  public tabsIndex: number = 0
  @ViewChild('myTabs') tabRef: Tabs;

  constructor(private nav: NavController,
              private events: Events,
              private _detector: ChangeDetectorRef) {
    this.feedTab = FeedTab
    this.createPostTab = CreatePostTab
    this.activityTab = ActivityTab
    this.profilePageTab = ProfilePage

    this.events.subscribe('activity:count', (data) => {
      let count = data.pop()
      if (count && 'unSeen' in count) {
        let prevActivityCount = this.activityCount;
        this.activityCount = parseInt(count.unSeen, 10)
        if (prevActivityCount != this.activityCount) {
          Badge.set(count.unSeen)
        }
        this._detector.detectChanges();
      }
    })

    this.events.subscribe('CreatePostTab:close', (data) => {
      this.tabRef.select(0)
      let textAreas = document.getElementsByTagName('textarea')
      Array.prototype.forEach.call(textAreas, elm => elm.value = '')

    })

  }

  onPageWillEnter() {
    //  this._detector.detectChanges();
  }

  onPageDidEnter() {
    //  this._detector.detectChanges();
  }

  onPageWillLeave() {
    //  this._detector.detectChanges();
  }
}
