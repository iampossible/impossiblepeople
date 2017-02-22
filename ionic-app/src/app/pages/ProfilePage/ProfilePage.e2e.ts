import {AuthNavigator} from '../../../testing/navigators/AuthNavigator'
import {FeedNavigator} from '../../../testing/navigators/FeedNavigator'
import {Help} from '../../../testing/toolbox/Help';

describe('Profile Page', () => {
  afterEach(Help.clearState)

  describe('other user, not followed, other user profile', () => {
    beforeEach((done) => {
      AuthNavigator.logInValidUser()
        .then(() => {
          return FeedNavigator.goToFeed()
        })
        .then(() => {
          return FeedNavigator.tapOnAuthor('0c977bda')  // Mad Hatter
        })
        .thenFinally(() => {
          done()
        })
    })

    it('should display user information on public user profile', () => {
      expect($('.profile-picture').getAttribute('src')).toBeDefined()
      expect($('.user-name').getText()).toBe('The Mad Hatter')
      expect($('.user-location').getText()).toBe('Wonderland and far far beyond')
      expect($('.user-biography').getText()).toBe('I\'m not mad, I just love hats!')
      expect($('.user-url').getText()).toBe('https://en.wikipedia.org/wiki/The_Hatter')
    })

    it('should display the user\'s posts', () => {
      expect($$('.profile-page .post-card').count()).toBe(1)
    })

    it('should show follow link which changes to unfollow link when clicked', (done) => {
      var followLocator = by.className('follow-user-follow')
      browser.wait(protractor.ExpectedConditions.elementToBeClickable(element(followLocator)), 2000).then(() => {
        element(followLocator).click()
        var unfollowLocator = by.className('follow-user-unfollow')
        browser.wait(protractor.ExpectedConditions.elementToBeClickable(element(unfollowLocator)), 3000).then(() => {
          done()
        })
      })
    })
  })

  describe('other user, followed', () => {
    beforeEach((done) => {
      AuthNavigator.logInValidUser()
        .then(() => {
          return FeedNavigator.goToFeed()
        })
        .then(() => {
          return FeedNavigator.tapOnAuthor('37619fc1')  // White Rabbit
        })
        .thenFinally(() => {
          done()
        })
    })

    it('should show unfollow link which changes to follow link when clicked', (done) => {
      var followLocator = by.className('follow-user-follow')
      var unfollowLocator = by.className('follow-user-unfollow')
      browser.wait(protractor.ExpectedConditions.elementToBeClickable(element(unfollowLocator)), 2000).then(() => {
        element(unfollowLocator).click()
        browser.wait(protractor.ExpectedConditions.elementToBeClickable(element(followLocator)), 3000).then(() => {
          done()
        })
      })
    })
  })


  describe('other user profile', () => {

    beforeEach((done) => {
      AuthNavigator.logInValidUser()
        .then(() => {
          return FeedNavigator.goToFeed()
        })
        .then(() => {
          return FeedNavigator.tapOnAuthor('0c977bda')  // Mad Hatter
        })
        .thenFinally(() => {
          done()
        })
    })

    it('should show a notification when a user is reported', (done) => {
      var profileOptions = $$('.guest-profile-options').first();
      browser.wait(protractor.ExpectedConditions.elementToBeClickable(profileOptions), 2000).then(() => {
        return profileOptions.click()
      })
        .then(() => browser.sleep(1000))
        .then(() => {
          let reportButton = element(by.buttonText('Report User'))
          return reportButton.click();
        })
        .then(() => browser.sleep(1000))
        .then(() => {
          return browser.wait(protractor.ExpectedConditions.visibilityOf($('#feedback')), 2000).then(() => {
            expect($('#feedback').isDisplayed()).toBeTruthy()
          })
        })
        .then(done)
    })

    it('should show a notification when a user is blocked', (done) => {
      var profileOptions = $$('.guest-profile-options').first();
      browser.wait(protractor.ExpectedConditions.elementToBeClickable(profileOptions), 2000).then(() => {
        return profileOptions.click()
      })
        .then(() => browser.sleep(1000))
        .then(() => {
          let blockButton = element(by.buttonText('Block User'))
          return blockButton.click();
        })
        .then(() => browser.sleep(1000))
        .then(() => {
          return browser.wait(protractor.ExpectedConditions.visibilityOf($('#feedback')), 2000).then(() => {
            expect($('#feedback').isDisplayed()).toBeTruthy()
          })
        })
        .then(done)
    })

  })

  describe('current user', () => {
    beforeEach((done) => {
        FeedNavigator.goToFeed()
        .then(() => {
          return FeedNavigator.tapOnAuthor('e52c854d')  // Demo User
        }).thenCatch((err) => {
          console.error(err)
        })
        .thenFinally(() => {
          done()
        })
    })

    it('should not show the following link', () => {
      browser.wait(protractor.ExpectedConditions.invisibilityOf($('button.follow-user')), 2000)
    })
  })
})
