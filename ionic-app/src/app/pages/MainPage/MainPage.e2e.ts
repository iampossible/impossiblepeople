import {Expect} from '../../../testing/toolbox';
import {FeedNavigator} from '../../../testing/AppNavigator';
import {Help} from '../../../testing/toolbox/Help';

describe('MainPage', () => {
  beforeEach((done) => {
    FeedNavigator.goToFeed().then(done)
  })

  afterEach(Help.clearState)

  it('contains a Feed tab', () => {
    Expect.isPresent(element(by.className('feed-tab')));
  })

  it('contains a Post tab', () => {
    Expect.isPresent(element(by.className('post-tab')));
  })

  it('contains a Activity tab', () => {
    Expect.isPresent(element(by.className('activity-tab')));
  })

  it('contains a Profile tab', () => {
    Expect.isPresent(element(by.className('profile-tab')));
  })
})
