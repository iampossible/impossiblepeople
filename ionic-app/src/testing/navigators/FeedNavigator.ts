import {Expect} from './../toolbox'
import {AuthNavigator} from './AuthNavigator'
import {Help} from '../toolbox/Help'

export class FeedNavigator {

  public static goToFeed() {
    return AuthNavigator.logInValidUser().then(() => {
      return browser.wait(Expect.elementToBePresent(by.className('feed-tab')), 2000)
    })
  }

  /**
   * Taps on the supplied post card
   * @param cardElementID
   */
  public static tapOnPost(cardElementID:string) {
    return $('ion-card[data-post-id="' + cardElementID + '"] h1').click().then(() => {
      var selector = 'ion-content[data-post-id="' + cardElementID + '"]'
      return browser.wait(Expect.selectorToBePresent(selector), 2000)
    })
  }

  static tapOnAuthor(postAuthorID:string) {
    const authorPhoto = `.post-creator[data-post-author-id="${postAuthorID}"] .post-author-photo`
    return browser.wait(protractor.ExpectedConditions.visibilityOf($(authorPhoto)), 2000)
      .then(() => {
        return $(authorPhoto).click()
      })
      .then(() => {
        // TODO moving-wait
        browser.sleep(250)
        return Help.waitForElementToBeVisible($('.public-profile-page'))
      })
  }
}
