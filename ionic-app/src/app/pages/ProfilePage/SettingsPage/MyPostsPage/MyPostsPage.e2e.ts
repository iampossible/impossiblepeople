import {ProfileNavigator} from '../../../../../testing/AppNavigator'
import {Help} from '../../../../../testing/toolbox/Help';

describe('MyPostsPage', () => {

  beforeEach((done) => {
    ProfileNavigator
      .goToProfilePageAsCheshireCat()
      .then(() => {
        return ProfileNavigator.goToMyPosts()
      })
      .then(() => browser.sleep(500))
      .then(done)
  })

  afterEach(Help.clearState)

  it('should show notification and remove from list when post is deleted', (done) => {
    var postOptionsButton = element(by.css('.my-posts-page .post-card .post-options'));
    browser.wait(protractor.ExpectedConditions.elementToBeClickable(postOptionsButton), 2000).then(() => {
      return postOptionsButton.click()
    })
      .then(() => browser.sleep(200))
      .then(() => {
        let deleteButton = element(by.buttonText('Delete'))
        return browser.wait(protractor.ExpectedConditions.elementToBeClickable(deleteButton), 2000)
      })
      .then(() => browser.sleep(1000))
      .then(() => {
        let deleteButton = element(by.buttonText('Delete'))
        return deleteButton.click()
      })
      .then(() => {
        return browser.wait(protractor.ExpectedConditions.visibilityOf($('#feedback')), 2000).then(() => {
          expect($('#feedback').isDisplayed()).toBeTruthy()
        })
      })
      .then(() => {
        expect($$('.my-posts-page .post-card')).toEqual([])
        done()
      })
  })

})
