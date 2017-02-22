import {Expect, Interact} from '../../../../testing/toolbox'
import {AuthNavigator} from '../../../../testing/AppNavigator'
import {Help} from '../../../../testing/toolbox/Help';

describe('SignUp page', () => {

  afterEach(Help.clearState)

  describe('furniture', () => {

    let furniture = [
      '.password-input',
      '.email-input',
      'button',
      '.first-name-input',
      '.last-name-input',
      '.disclaimer',
      '.terms-link',
      '.privacy-link'
    ]

    beforeAll((done)=> {
      AuthNavigator.goToSignUpPage().then(done)
    });

    for (var selector of furniture) {
      it('should contain element: ' + selector, () => {
        element(by.css('.create-account ' + selector)).isDisplayed()
      })
    }

  })

  describe('disclaimers links', () => {
    beforeEach((done) => {
      AuthNavigator.goToSignUpPage().then(done)
    })

    it('should take the user to the TERMS page', (done) => {
      $('.terms-link').click()
        .then(() => browser.sleep(200))
        .then(() => {
          Expect.elementToBePresent(by.className('.terms-conditions'))
        }).then(done)
    })

    it('should take the user to the PRIVACY page', (done) => {
      $('.privacy-link').click()
        .then(() => browser.sleep(200))
        .then(() => {
          Expect.elementToBePresent(by.className('.privacy-policy'))
        }).then(done)
    })
  })

  describe('creating an account', () => {
    beforeAll((done)=> {
      AuthNavigator.goToSignUpPage().then(done)
    });

    it('should reject an existing user', () => {
      AuthNavigator.createAccount('user@example.com', 'whocares')
      Expect.errorMessage('An account has already been created for this email address')
    })

    it('should reject an invalid email', () => {
      AuthNavigator.createAccount('user', 'whocares')
      Expect.errorMessage('Please enter a valid email address')
    })

    it('should reject an empty field', () => {
      AuthNavigator.createAccount('', 'whocares')
      Expect.errorMessage('Please provide all required fields')
    })

    it('should accept a new user', (done) => {
      AuthNavigator.createAccount('someone@new.com', 'newpassword').then(() => {
        return browser.wait(Expect.currentUrlToMatch(/\/#\/user\/interests$/), 2000, 'did not navigate to interest page')
      }).then(() => {
        return browser.wait(Expect.elementCountToBeAtLeast(2, by.className('featured-interest')), 2000, 'could not find featured interests')
      }).then(done)
    })
  })

  describe('creating an account from an invite', () => {

    beforeAll((done)=> {
      AuthNavigator.goToSignUpPage().then(done)
    });

    it('should convert my invitee node into an account', (done) => {
      AuthNavigator.createAccount('invitee@impossible.com', 'whocares').then(() => {
        return browser.wait(Expect.currentUrlToMatch(/\/#\/user\/interests$/), 2000, 'did not navigate to interest page')
      }).then(() => {
        browser.executeScript('return window.localStorage.getItem("USER_ID");').then((USER_ID) => {
          expect(USER_ID).toBe('8867ddf0'); //invitee@impossible.com
        }).then(done)
      })
    })
  })
})
