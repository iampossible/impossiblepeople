import {Expect} from '../../../../testing/toolbox'
import {AuthNavigator, ProfileNavigator} from '../../../../testing/AppNavigator'
import {Help} from '../../../../testing/toolbox/Help';

describe('Interests page', () => {
  const interestSelector = '.interest-page button.featured-interest'

  afterEach(Help.clearState)

  describe('content', () => {
    beforeEach((done) => {
      AuthNavigator.logInAlice().then(done)
    })

    it('should show the featured interests', () => {
      browser.wait(Expect.elementCountToBe(19, by.css(interestSelector)), 20000)
    })

    it('should show a "Suggest something..." button', (done) => {
      ProfileNavigator.swipeInterestsLeft()
        .then(() => browser.sleep(300))
        .then(() => {
          return browser.wait(protractor.ExpectedConditions.elementToBeClickable(
            element(by.css('.suggest-interest'))
          ), 2000)
        })
        .then((clickable) => {
          expect(clickable).toBeTruthy()
          done()
        })
    })
  })

  describe('selecting interests', () => {
    it('should persist selected interests', () => {
      AuthNavigator.createAccount('userthatdoesnt@exist.com', 'hello').then(() => {
        return browser.sleep(999)  // TODO *shakes fist at protractor*
      }).then(() => {
        return $$(interestSelector).get(1).click()
      }).then(() => {
        return $$(interestSelector).get(2).click()
      }).then(() => {
        return element(by.buttonText('View more')).click()
      }).then(() => {
        browser.wait(protractor.ExpectedConditions.presenceOf($('.swiper-slide-prev')), 2000, 'there is no previous slide')
      }).then(() => {
        return element(by.buttonText('Done')).click()
      }).then(() => {
        return browser.wait(protractor.ExpectedConditions.visibilityOf(element(by.css('.add-location-context'))), 2000, 'did not get to location page')
      })
    })

    it('should update button text on swipe', () => {
      AuthNavigator.createAccount('ialsodont@exist.com', 'hello').then(() => {
        return browser.sleep(2500)  // TODO *shakes fist at protractor*
      }).then(() => {
        return ProfileNavigator.swipeInterestsLeft()
      }).then(() => {
        browser.wait(protractor.ExpectedConditions.presenceOf(element(by.buttonText('Done'))), 2000, 'button did not change to "Done"')
      })
    })
  })
})
