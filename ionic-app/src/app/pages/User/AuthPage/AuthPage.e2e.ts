import {Expect, Help} from '../../../../testing/toolbox'
import {AuthNavigator} from '../../../../testing/AppNavigator'

describe('Auth page', () => {

  beforeEach((done) => AuthNavigator.goToAuthPage().then(done))

  afterEach(Help.clearState)

  for (var selector of ['.password-input', '.email-input', 'button']) {
    it('should contain login furniture: ' + selector, ((selector) => {
      return (done) => {
        element(by.css('.auth ' + selector)).isDisplayed().then(() => {
          done()
        }).thenCatch(done)
      }
    })(selector))
  }

  describe('logging in', () => {
    it('should reject an invalid user', () => {
      AuthNavigator.logInWithUser('fake@user.com', 'lieslieslies')
      Expect.errorMessage('The email and password you entered did not match our records. Please try again.');
    })

    it('should reject an invalid password', () => {
      AuthNavigator.logInWithUser('user@example.com', 'lieslieslies')
      Expect.errorMessage('The email and password you entered did not match our records. Please try again.');
    })

    it('should accept a valid user', () => {
      AuthNavigator.logInValidUser()
    })

    it('should send a user with no interests to the interests page', () => {
      AuthNavigator.logInAlice()
    })

    it('should send a user with interests but no location to the location modal', () => {
      AuthNavigator.logInQueenOfHearts()
    })
  })

  describe('forgotten password', () => {
    it('should take you to the forgotten password screen when you click forgotten password button', () => {
      $('.forgotten-password-button').click();
      browser.wait(Expect.elementToBePresent(by.css('.forgotten-password-page')), 2000)
    })
  })
})