import {Expect, Interact} from '../../../../testing/toolbox'
import {Help} from '../../../../testing/toolbox/Help'
import {AuthNavigator} from '../../../../testing/navigators/AuthNavigator';

describe('ForgottenPassword page', () => {

  beforeEach((done) => AuthNavigator.goToForgottenPasswordPage().then(done))

  afterEach(Help.clearState)

  function recoverPassword(name) {
    return Interact
      .typeInto($('.forgotten-password-page .email-input ion-input > input'), name)
      .then(() => {
        return $('.forgotten-password-page button.send').click()
      }).then(() => {
        return browser.sleep(600)
      })
  }

  describe('recover password form', () => {
    it('should show feedback and redirect to landing page on success', (done) => {
      recoverPassword('miaumiau@example.com')
        .then(() => {
          return browser.wait(protractor.ExpectedConditions.visibilityOf($('#feedback')), 2000, 'feedback never appeared')
        })
        .then(() => {
          return browser.wait(protractor.ExpectedConditions.visibilityOf($('.landing-wrapper')), 2000, 'landing page never appeared')
        })
        .then(done)
    });

    it('should show error message if user not found', () => {
      recoverPassword('madeup@email.missing')
        .then(() => {
          return Expect.errorMessage('Please make sure you have entered the correct email address.');
        })
    });

    it('should show error message if user from Facebook', () => {
      recoverPassword('monster@chimney.sweep')
        .then(() => {
          return Expect.errorMessage('Please sign in using Facebook. As a Facebook user, you don\'t need to reset your password using this service.');
        })
    });
  })
})
