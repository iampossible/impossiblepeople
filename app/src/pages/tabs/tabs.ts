import { Component } from '@angular/core';

import { ActivityPage } from '../activity/activity';
import { CreatePostPage } from '../create-post/create-post';
import { FeedPage } from '../feed/feed';
import { AboutPage } from '../about/about';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = FeedPage;
  tab2Root = CreatePostPage;
  tab3Root = ActivityPage;
  tab4Root = AboutPage;

  constructor() {

  }
}
