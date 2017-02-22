import {Expect, Interact} from './../toolbox'
import {LandingPageNavigator} from './LandingPageNavigator'
import {NavigatorHelper} from './NavigatorHelper'

export class AuthNavigator {

  public static goToAuthPage() {
    return LandingPageNavigator.goToLandingPage()
      .then(() => Interact.clickOn($('.log-in-button')))
      .then(() => browser.wait(protractor.ExpectedConditions.visibilityOf($('.public-profile-page')), 2000))
     // .then(() => browser.wait(Expect.currentUrlToBe('/#/user/auth'),2000)))
  }

  public static goToSignUpPage() {
    LandingPageNavigator.goToLandingPage().then(() => {
      Interact.clickOn(element(by.buttonText('Sign up with email')))
      return browser.wait(Expect.currentUrlToBe('/#/user/create'),2000)
    })
  }

  public static goToForgottenPasswordPage() {
    return AuthNavigator.goToAuthPage().then(() => {
      $('.forgotten-password-button').click()
      return browser.wait(Expect.elementToBePresent(by.css('.forgotten-password-page')), 2000)
    })
  }

  /**
   * Login valid user example user
   */
  public static logInValidUser() {
    return this.logInWithUser('user@example.com', 'somepassword').then(() => {
      return browser.wait(Expect.elementToBePresent(by.css('.feed-tab')), 2000)
    })
   // return browser.wait(Expect.currentUrlToMatch(/\/#\/home$/), 2000)
  }

  /**
   * Login valid user Alice
   */
  public static logInAlice() {
    this.logInWithUser('alice@wonderland.com', 'somewhere')
    return browser.wait(Expect.currentUrlToMatch(/\/#\/user\/interests/), 2000)
  }

  /**
   * Login valid user The Mad Hatter
   */
  public static logInTheMadHatter() {
    this.logInWithUser('im.not.mad@example.com', 'muchmoremuchier')
    return browser.wait(Expect.currentUrlToMatch(/\/#\/home$/), 2000)
  }

  public static logInQueenOfHearts() {
    this.logInWithUser('queen@hearts.cards', 'offwiththeirheads')
    return browser.wait(protractor.ExpectedConditions.visibilityOf(element(by.css('.add-location-context'))), 2000)
  }

  public static logInChesireCat() {
    this.logInWithUser('miaumiau@example.com', 'smiles')
    return browser.wait(Expect.currentUrlToMatch(/\/#\/home$/), 2000)
  }

  /**
   * Login with user for tests
   * @param usr {string} The username
   * @param pwd {string} The password
   */
  public static logInWithUser(usr:string, pwd:string) {
    //NavigatorHelper.goToPath('/#/user/auth', by.className('auth-page'))
    return LandingPageNavigator.goToLandingPage().then(() => {
      return Interact.clickOn($('.log-in-button')).then(() => {
        Interact.typeInto($$('.email-input ion-input > input').last(), usr)
        Interact.typeInto($$('.password-input ion-input > input').last(), pwd)
        return Interact.clickOn(element.all(by.buttonText('Log in')).last())
      })
    })
  }

  public static createAccount = function (email:string, pwd:string) {
    return this.goToSignUpPage().then(() => {
      return Interact.typeInto($('.create-account .email-input ion-input > input'), email).then(() => {
        return Interact.typeInto($('.create-account .password-input ion-input > input'), pwd).then(() => {
          return Interact.typeInto($('.create-account .first-name-input ion-input > input'), 'Dummy').then(() => {
            return Interact.typeInto($('.create-account .last-name-input ion-input > input'), 'Name').then(() => {
              return browser.sleep(500).then(() => {
                return Interact.clickOn(element.all(by.buttonText('Create account')).last())
              })
            })
          })
        })
      })
    })
  }
}
