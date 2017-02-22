import {AuthNavigator} from './AuthNavigator'
import {Interact} from '../toolbox'

export class ProfileNavigator {

  public static goToProfilePage() {
    return AuthNavigator.logInValidUser()
      .then(() => browser.sleep(200))
      .then(() => element(by.id('tab-t0-3')).click())
      .then(() => element(by.className('user-settings')).click())
      .then(() => browser.wait(protractor.ExpectedConditions.visibilityOf($('.public-profile-page')), 2000))
  }

  public static goToProfilePageAsCheshireCat() {
    return AuthNavigator.logInChesireCat()
      .then(() => element(by.id('tab-t0-3')).click())
      .then(() => element(by.className('user-settings')).click())
      .then(() => browser.wait(protractor.ExpectedConditions.visibilityOf($('.public-profile-page')), 2000))
  }

  public static goToPreferencesPage() {
    return this.goToProfilePage().then(() => {
      return browser.sleep(300).then(() => {
        return element(by.buttonText('Settings')).click().then(() => {
          return browser.wait(protractor.ExpectedConditions.visibilityOf($('.preferences-page')), 2000)
        })
      })
    })
  }

  public static swipeInterestsLeft() {
    return browser.driver
      .actions()
      .mouseDown(element(by.css('.swiper-slide-active')).getWebElement())
      .mouseMove({x: -100, y: 0})
      .mouseUp()
      .perform()
      .then(() => {
        return browser.wait(
          protractor.ExpectedConditions.presenceOf($('.swiper-slide-prev')),
          2000,
          'there is no previous slide'
        )
      })
  }

  public static saveProfile() {
    return browser.sleep(200).then(() => {
      return element(by.buttonText('Save')).click().then(() => {
        return browser.wait(protractor.ExpectedConditions.visibilityOf($('.settings-page')), 2000)
      })
    })
  }

  public static editProfile() {
    return element(by.buttonText('Edit')).click().then(() => {
      return browser.wait(protractor.ExpectedConditions.visibilityOf($('.edit-profile-modal')), 2000)
    })
  }

  public static changeName(firstName:string, lastName:string) {
    return Interact.typeInto($('.profile-first-name input'), firstName).then(() => {
      return Interact.typeInto($('.profile-last-name input'), lastName)
    })
  }

  public static changeBiography(bio:string) {
    return Interact.typeInto($('.profile-bio input'), bio)
  }
  public static changeUrl(url:string) {
    return Interact.typeInto($('.profile-url input'), url)
  }

  public static goToMyPosts() {
    return element(by.css('.my-posts')).click()
      .then(() => {
        return browser.wait(protractor.ExpectedConditions.presenceOf(element(by.css('.my-posts-page'))), 2000);
      })
  }
}
