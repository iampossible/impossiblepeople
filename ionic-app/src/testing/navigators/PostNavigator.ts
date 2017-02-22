import {FeedNavigator} from './FeedNavigator'
import {Expect, Interact} from './../toolbox'
import {AuthNavigator} from './AuthNavigator'
import {NavigatorHelper} from './NavigatorHelper'
import {Help} from '../toolbox/Help'

export class PostNavigator {

  public static goToPostDetails(postID?:string) {
    return NavigatorHelper.goToPath('/#/home', by.css('post-card'))
      .then(() => FeedNavigator.tapOnPost(postID ? postID : 'dfaffa58'))
      .then(() => browser.sleep(250))
      .then(() => Help.waitForElementToBeVisible($('.post-detail-page')))
  }

  public static createComment(commentText:string) {
    return Interact.typeInto($('.post-reply textarea'), 'This is a comment').then(() => {
      return $('.post-reply button').click()
    })
  }

  public static swipeElementLeft(locator:string) {
    return browser.driver
      .actions()
      .mouseDown($$(locator).first().getWebElement())
      .mouseMove({ x: -100, y: 0 })
      .mouseUp()
      .perform()
      .then(() => browser.sleep(400))
  }

  public static goToCreatePostPage() {
    return AuthNavigator.logInValidUser().then(()=> {
      return element(by.id('tab-0-1')).click().then(()=> {
        return Help.waitForElementToBeVisible($('.create-post-tab'))
      })
    })
  }

  public static createPost(content:string, interest:string, timeRequired?:string) {
    return Interact.typeInto($('.create-post-input textarea'), content)
      .then(() => {
        if (timeRequired) {
          $('button-dropdown .dropdown-button').click().then(() => {
            return element(by.buttonText(timeRequired)).click()
          })
        }
      })
      .then(() => {
        let interestButton = element(by.buttonText(interest))
        return $('.select-category').click().then(() => {
          return Help.waitForElementToBeVisible($('.tag-interest-modal')).then(() => {
            return browser.sleep(500)
          })
        })
          .then(() => Help.waitForElementToBeVisible(interestButton))
          .then(() => interestButton.click())
          .then(() => Help.waitForElementToBeVisible(element(by.buttonText('Save'))))
          .then(() => {
            return element(by.buttonText('Save')).click().then(() => {
              return browser.sleep(500)
            })
          })
      })
      .then(() => {
        return element(by.buttonText('Post')).click().then(() => {
          return browser.wait(Expect.currentUrlToBe('/#/home'), 2000)
        })
      })
  }

}
