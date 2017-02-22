import {ProfileNavigator} from '../../../../../testing/navigators/ProfileNavigator'
import {Help} from '../../../../../testing/toolbox/Help';

describe('My Friends Page', () => {

  beforeEach((done) => {
    ProfileNavigator.goToProfilePage().then(() => {
      return $('.my-friends-button').click().then(() => {
        return browser.wait(protractor.ExpectedConditions.visibilityOf($('.friends-list')), 5000)
      })
    })
      .then(done)
  })

  afterEach(Help.clearState)

  it('should list people that I follow', () => {
    expect($$('.friends-list-item').count()).toBeGreaterThan(0)
  })

  // TODO: refactor on a rainy day [Jesus wept, protractor...]
  it('should allow me to unfollow and re-follow a friend', (done) => {
    var toggle = element(by.css('.follow-toggle'))
    browser.sleep(500)
    toggle.click()
    browser.waitForAngular().then(() => {
      toggle.getText().then(text => {
        expect(text.toLowerCase()).toBe('follow')
        toggle.click()
        browser.waitForAngular().then(() => {
          toggle.getText().then((text) => {
            expect(text.toLowerCase()).toBe('unfollow')
            done()
          })
        })
      })
    })
  })

  it('should take me to the profile page of the person I click', (done) => {
    var friendName
    browser.sleep(500)
      .then(() => {
        friendName = $('.friends-list-item-info h2').getText()
        $('.friends-list-item-info').click()
      })
      .then(() => browser.wait(protractor.ExpectedConditions.visibilityOf($$('.public-profile-page').last()), 2000))
      .then(() => {
        expect($$('.public-profile-page .user-name').last().getText()).toBe(friendName)
        done()
      })
  })

})
