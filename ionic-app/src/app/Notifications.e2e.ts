
import {Expect, Help, Interact} from '../testing/toolbox'
import {LandingPageNavigator} from '../testing/AppNavigator'
import {AuthNavigator} from '../testing/navigators/AuthNavigator'
import {FeedNavigator} from '../testing/navigators/FeedNavigator'
import {PostNavigator} from '../testing/navigators/PostNavigator';

xdescribe('Landing Page', () => {
  const logInButton = $('.log-in-button')

  beforeEach((done) => {
    AuthNavigator.logInValidUser().then(done)
  })

  afterEach(Help.clearState)

  it('should take user to post when push notification arrived', () => {
    const postID = '46b047b4'
    Help.triggerIonicEvent('notifications:receive', { additionalData: { postID } })
    browser.wait(Expect.currentUrlToBe(`/#/post/${postID}`), 2000)
  })
})
