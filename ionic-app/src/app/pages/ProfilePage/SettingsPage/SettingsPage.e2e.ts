import {Expect, Interact} from '../../../../testing/toolbox'
import {ProfileNavigator} from '../../../../testing/AppNavigator'
import {DatabaseHelper} from '../../../../testing/DatabaseHelper'
import {Help} from '../../../../testing/toolbox/Help';

describe('SettingsPage', () => {
  let postCount = 0
  let interestCount = 0
  let currentLocation = 'Lawrence Township'

  beforeAll((done) => {
    DatabaseHelper.runCypher(
      'MATCH (:Person { userID: {userID} }) -[:OFFERS|:ASKS]-> (p:Post) RETURN p',
      {userID: 'e52c854d'}  // Demo User
    ).then((posts:Array<any>) => {
      postCount = posts.length
      return DatabaseHelper.runCypher(
        'MATCH (:Person { userID: {userID} }) -[:INTERESTED_IN]-> (i:Interest) RETURN i',
        {userID: 'e52c854d'}  // Demo User
      ).then((interests:Array<any>) => {
        interestCount = interests.length
        done()
      })
    }).catch((error) => {
      console.error(error)
      done()
    })
  })


  describe('furniture', () => {
    beforeAll((done) => {
      ProfileNavigator.goToProfilePage().then(() => {
        DatabaseHelper.runCypher(
          'MATCH (p:Person { userID: {userID} }) RETURN p',
          {userID: 'e52c854d'}  // Demo User
        ).then((people:Array<any>) => {
          currentLocation = people[0].location
          done()
        }).catch((error) => {
          console.error(error)
          done()
        })
      })
    })

    afterAll(Help.clearState)

    for (var selector of ['.user-name', '.user-biography', '.user-location']) {
      it('should contain profile element: ' + selector, ((selector) => (done) => {
        element(by.css(selector)).isDisplayed().then(done)
      })(selector))
    }
  })


  describe('UI', () => {



    beforeEach((done) => {
      ProfileNavigator.goToProfilePage().then(() => {
        DatabaseHelper.runCypher(
          'MATCH (p:Person { userID: {userID} }) RETURN p',
          {userID: 'e52c854d'}  // Demo User
        ).then((people:Array<any>) => {
          currentLocation = people[0].location
          done()
        }).catch((error) => {
          console.error(error)
          done()
        })
      })
    })

    afterEach(Help.clearState)

    it('should be populated with user data', () => {
      browser.wait(Expect.elementToBePresent(by.buttonText(`Posts (${postCount})`)), 2000).then(() => {
        browser.wait(Expect.elementToBePresent(by.buttonText(`Interests (${interestCount})`)), 2000).then(() => {
          expect(element(by.className('user-location')).getText()).toEqual(currentLocation)
        })
      })
    })

    it('should show the user their feed when the post button is pressed', (done) => {
      var postButton = element(by.buttonText(`Posts (${postCount})`))
      browser.wait(protractor.ExpectedConditions.elementToBeClickable(postButton), 2000).then(() => {
        postButton.click().then(() => {
          return browser.wait(Expect.elementCountToBe(postCount, by.css('.my-posts-page post-card')), 2000)
        }).then(done)
      })
    })

    it('should take user to edit profile page when edit button is pressed', (done) => {
      element(by.buttonText('Edit')).click()
        .then(() => {
          return browser.wait(Expect.currentUrlToMatch(/\/#\/user\/profile\/edit/), 2000)
        })
        .then(done)
    })

    it('should allow the user to edit their selected interests', (done) => {
      element(by.buttonText(`Interests (${interestCount})`)).click()
        .then(() => {
          return browser.wait(Expect.currentUrlToMatch(/\/#\/user\/interests/), 2000)
        })
        .then(() => {
          let interestSelector = $$('.interest-page button.featured-interest')
          return Promise.all([interestSelector.get(0).click(), interestSelector.get(1).click()])
        })
        .then(() => ProfileNavigator.swipeInterestsLeft())
        .then(() => browser.sleep(200))
        .then(() => ProfileNavigator.saveProfile())
        .then(() => {
          return browser.wait(protractor.ExpectedConditions.presenceOf(element(by.buttonText(`Interests (${interestCount + 2})`))), 2000, `fount ${interestCount} instead of ${interestCount+2}`)
        })
        .then(done)
    })

    it('should take user to find friends page when find friends button is pressed', (done) => {
      element(by.buttonText('Find and invite friends')).click()
        .then(() => {
          return browser.wait(Expect.elementToBePresent(by.css('.find-friends-page')), 2000)
        })
        .then(done)
    })

    it('should take user to settings page when settings options is pressed', (done) => {
      element(by.buttonText('Settings')).click()
        .then(() => {
          return browser.wait(Expect.elementToBePresent(by.css('.preferences-page')), 2000)
        })
        .then(done)
    })
  })
})
