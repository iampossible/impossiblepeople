import {Expect, Help, Interact} from '../../../../testing/toolbox'
import {ActivityNavigator} from '../../../../testing/AppNavigator'
import {DatabaseHelper} from '../../../../testing/DatabaseHelper'

//PENDING ACTIVITY WORKERS
xdescribe('ActivityTab', () => {

  beforeEach((done) => ActivityNavigator.goToActivityPage().then(done))

  afterEach(Help.clearState)

  it('should contain multiple activities', (done) => {
    browser.wait(Expect.elementCountToBeAtLeast(2, by.css('.activity.type-comment')), 2000).then(done)
  })

  it('should differentiate between types of activity', (done) => {
    browser.wait(
      protractor.ExpectedConditions.textToBePresentInElement(
        element(by.css('p.own-post')),
        'Commented on your post'
      ), 2000).then(() => browser.wait(
        protractor.ExpectedConditions.textToBePresentInElement(
          element(by.css('p.other-post')),
          'Replied to your comment'
        ), 500).then(done))
  })

  it('should open post details after clicking a post related activity', (done) => {

    $$('.activity.type-comment').first().click().then(() => {
      browser.wait(Expect.elementToBePresent(by.className('post-title')), 2000).then(() => {
        Expect.elementToBePresent(by.className('post-type'))
        done()
      })
    })

  })

  it('should open profile page after clicking image on activity', (done) => {
    $$('.activity.type-comment > ion-avatar').first()
      .click()
      .then(() => {
        return Help.waitForElementToBeVisible($('.public-profile-page'))
      })
      .then(() => {
        console.log('profile visible')
        expect($('.user-name').getText()).toBe('White Rabbit')
      }).then(done);
  })

})
