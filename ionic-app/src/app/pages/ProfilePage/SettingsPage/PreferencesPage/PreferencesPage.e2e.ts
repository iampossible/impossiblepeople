import {Expect, Interact} from '../../../../../testing/toolbox'
import {ProfileNavigator} from '../../../../../testing/AppNavigator'
import {DatabaseHelper} from '../../../../../testing/DatabaseHelper'
import {Help} from '../../../../../testing/toolbox/Help'

describe('PreferencesPage', () => {

  beforeEach((done) => {
    ProfileNavigator.goToPreferencesPage().then(done)
  })

  afterEach(Help.clearState)

  it('should contain the user\'s email address', () => {
    browser.wait(protractor.ExpectedConditions.textToBePresentInElement(
      element(by.css('.user-email-address')),
      'Email: user@example.com'
    ), 2000)
  })

  it('should take user to email page when email button is pressed', (done) => {
    var emailButton = element(by.css('.user-email-address'))
    browser.wait(protractor.ExpectedConditions.elementToBeClickable(emailButton), 2000).then(() => {
      return browser.sleep(500).then(() => {
        return emailButton.click().then(() => {
          return browser.wait(Expect.elementToBePresent(by.css('.user-email-input')), 2000)
        })
      })
    }).then(done)
  })

  it('should take user to Privacy Policy page', (done) => {
    var linkButton = element(by.css('.user-privacy-policy'))
    browser.wait(protractor.ExpectedConditions.elementToBeClickable(linkButton), 2000).then(() => {
      return browser.sleep(500).then(() => {
        return linkButton.click().then(() => {
          return browser.wait(Expect.elementToBePresent(by.css('.privacy-policy')), 2000)
        })
      })
    }).then(done)
  })

  it('should take user to T&C page', (done) => {
    var linkButton = element(by.css('.user-terms-conditions'))
    browser.wait(protractor.ExpectedConditions.elementToBeClickable(linkButton), 2000).then(() => {
      return browser.sleep(500).then(() => {
        return linkButton.click().then(() => {
          return browser.wait(Expect.elementToBePresent(by.css('.terms-conditions')), 2000)
        })
      })
    }).then(done)
  })

  describe('update email address', () => {
    let email:string = 'sameuser@example.com'

    afterAll((done) => DatabaseHelper.runCypher(
      'MATCH (p:Person { email: { email } }) SET p.email = "user@example.com"',
      {email}
    ).then(done))

    it('should show the updated email when saved from email page', (done) => {
      var emailButton = element(by.css('.user-email-address'))

      browser.sleep(800)
        .then(() => emailButton.click())
        .then(() => browser.sleep(1000))
        .then(() => Interact.typeInto($('.user-email-input'), email))
        .then(() => element(by.buttonText('Save')).click())
        .then(() => browser.sleep(1000))
        .then(() => {
          expect($('.user-email-address').getText()).toBe(`Email: ${email}`)
          done()
        })
    })
  })

  describe('Log Out button', () => {

    beforeEach((done) => {
      let logOutButton = element(by.css('.log-out'))
      browser.wait(protractor.ExpectedConditions.elementToBeClickable(logOutButton), 2000).then(() => {
        return browser.sleep(500).then(() => {
          return logOutButton.click().then(() => {
            return browser.wait(protractor.ExpectedConditions.visibilityOf($('ion-action-sheet')), 2000)
          })
        })
      }).then(done)
    })

    it('should redirect the user to the landing page if confirmed', (done) => {
      let confirmButton = $('.action-sheet-destructive')

      browser
        .wait(protractor.ExpectedConditions.elementToBeClickable(confirmButton), 2500)
        .then(() => browser.sleep(1000))
        .then(() => confirmButton.click())
        .then(() => browser.wait(protractor.ExpectedConditions.visibilityOf($('.landing-buttons')), 2000, 'not on landing page'))
        .then(() => browser.navigate().back())
        .then(() => browser.wait(protractor.ExpectedConditions.visibilityOf($('.landing-buttons')), 2000, 'not on landing page'))
        .then(done)
    })

    it('should disappear if cancelled', (done) => {
      let cancelButton = $('.action-sheet-cancel')
      browser.wait(protractor.ExpectedConditions.elementToBeClickable(cancelButton), 2500).then(() => {
        return browser.sleep(500).then(() => {
          return cancelButton.click().then(() => {
            return browser.wait(protractor.ExpectedConditions.not(
              protractor.ExpectedConditions.presenceOf($('ion-action-sheet'))),
              2000
            )
          })
        })
      }).then(done)
    })
  })

})


