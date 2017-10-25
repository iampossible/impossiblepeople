import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Tabs, Events } from 'ionic-angular';

import { ActivityPage } from '../activity/activity';
import { CreatePostPage } from '../create-post/create-post';
import { FeedPage } from '../feed/feed';
import { ProfilePage } from '../profile/profile';
import { Badge } from '@ionic-native/badge';
import { ExplorePage } from '../explore/explore';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = FeedPage;
  tab2Root = CreatePostPage;
  tab3Root = ActivityPage;
  tab4Root = ProfilePage;
  tab5Root = ExplorePage;

  public activityCount: number = 0;
  public tabsIndex: number = 0;
  @ViewChild('myTabs') tabRef: Tabs;
  constructor(
    private events: Events,
    private _detector: ChangeDetectorRef,
    private badge: Badge) {
    this.events.subscribe('activity:count', (count) => {
      if (count && 'unSeen' in count) {
        let prevActivityCount = this.activityCount;
        this.activityCount = parseInt(count.unSeen, 10);
        if (prevActivityCount !== this.activityCount) {
          this.badge.set(count.unSeen);
        }
        this._detector.detectChanges();
      }
    });

    this.events.subscribe('CreatePostTab:close', () => {
      this.tabRef.select(0);
      let textAreas = document.getElementsByTagName('textarea');
      Array.prototype.forEach.call(textAreas, elm => elm.value = '');
    });
  }
}
