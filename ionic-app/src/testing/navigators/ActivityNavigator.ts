import {AuthNavigator} from './AuthNavigator'
import {FeedNavigator} from './FeedNavigator'

export class ActivityNavigator {

  public static goToActivityPage() {
    return AuthNavigator.logInTheMadHatter().then(() => {
      return element(by.id('tab-0-2')).click().then(() => {
        return browser.wait(protractor.ExpectedConditions.visibilityOf(element(by.className('activity-tab'))), 2000)
      })
    })
  }

}