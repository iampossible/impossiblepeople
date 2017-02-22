import {PostNavigator, FeedNavigator} from '../../../../testing/AppNavigator'
import {Interact, Expect, Help} from '../../../../testing/toolbox'

describe('Main Feed', () => {

  describe("Feed banners", () => {
    beforeAll((done) => {
      FeedNavigator.goToFeed().then(done)
    })

    it('should display top notification banner', () => {
      Expect.elementToBePresent(by.id('#top-notification-banner'))
    })

    it('should display intro banner', () => {
      Expect.elementToBePresent(by.id('#home-intro-state'))
    })

    it('should dismiss top notification banner but keep intro banner on navigation', () => {
      $('#tab-0-3').click()
        .then(() => browser.sleep(500))
        .then(() => $('#tab-0-0').click())
        .then(() => browser.sleep(500))
        .then(() => {
          expect($('#home-intro-state').isPresent()).toBeTruthy()
          expect($('#top-notification-banner').isPresent()).toBeFalsy()
        })
    })

    describe("Feed banners CTA", () => {
      beforeEach((done) => {
        Help.clearBanners()
          .then(() => FeedNavigator.goToFeed())
          .then(done)
      })

      xit('should open createPostModal on intro banner CTA and dismiss intro banner', () => {
        browser.sleep(500)
          .then(() => $('#welcome-offer-button').click())
          .then(() => browser.sleep(500))
          .then(() => {
            expect($('.create-post-tab').isPresent()).toBeTruthy()

            return $$('.button-light').last().click().then(() => {
              return browser.wait(Expect.currentUrlToBe('/#/home'), 2000)
            })
          }).then(() => {
          expect($('#home-intro-state').isPresent()).toBeFalsy()
        })
      })

      it('should open editProfileModal on top banner CTA and dismiss top banner', () => {
        browser.sleep(500)
          .then(() => $('#top-notification-banner').click())
          .then(() => browser.sleep(500))
          .then(() => {
            expect($('.settings-page').isPresent()).toBeTruthy()

            return $$('.back-button').last().click().then(() => {
              return browser.wait(Expect.currentUrlToBe('/#/home'), 2000)
            })
          }).then(() => {
          expect($('#top-notification-banner').isPresent()).toBeFalsy()
        })
      })

      it('should dismiss intro banner on click close button', () => {
        browser.sleep(500)
          .then(() => {
            expect($('#home-intro-state').isPresent()).toBeTruthy()
            return $('.dismiss-welcome').click()
          }).then(() => browser.sleep(500))
          .then(() => {
            expect($('#home-intro-state').isPresent()).toBeFalsy()
          })
      })
    })

  })

  describe("tab button", () => {

    beforeAll((done) => FeedNavigator.goToFeed().then(done))
    afterAll(Help.clearState)

    let feedButton = $('#tab-0-0')
    let scrollContent = $('ion-content.feed-tab scroll-content')

    it('should scroll up if on the first page of the feed', () => {

      Interact.scrollDown(scrollContent, 500)
        .then(() => {
          Expect.elementScroll(scrollContent).toBeGreaterThan(499)
        })
        .then(() => feedButton.click())
        .then(() => browser.sleep(200))
        .then(() => {
          Expect.elementScroll(scrollContent).toBe(0)
        })
    })

    it('should navigate back if deep into a post details (no scroll up)', () => {
      Interact.scrollDown(scrollContent, 500)
        .then(() => {
          Expect.elementScroll(scrollContent).toBeGreaterThan(499)
        })
        .then(() => $$('post-card').get(2).click())
        .then(() => Help.waitForElementToBeVisible($('.post-detail-page')))
        .then(() => browser.sleep(300))
        .then(() => {
          //NOTE: android does not show tabs on post details
          browser.executeScript('arguments[0].click()', feedButton.getWebElement())
        })
        .then(() => browser.sleep(200))
        .then(() => {
          Expect.elementScroll(scrollContent).toBeGreaterThan(499)
        })
    })

    it('should keep the scroll position when moving to another tab and back', () => {

      let profileButton = $('#tab-0-3')

      Interact.scrollDown(scrollContent, 500)
        .then(() => {
          Expect.elementScroll(scrollContent).toBeGreaterThan(499)
        })
        .then(() => {
          //NOTE: android does not show tabs on post details
          browser.executeScript('arguments[0].click()', profileButton.getWebElement())
        })
        .then(() => browser.sleep(200))
        .then(() => {
          //NOTE: android does not show tabs on post details
          browser.executeScript('arguments[0].click()', feedButton.getWebElement())
        })
        .then(() => browser.sleep(200))
        .then(() => {
          Expect.elementScroll(scrollContent).toBeGreaterThan(499)
        })
    })

  })

  describe('post cards', () => {

    beforeAll((done) => FeedNavigator.goToFeed().then(done))
    afterAll(Help.clearState)

    it('should show the feed cards', () => {
      Expect.elementToBePresent(by.css('.post-card'))
    })

    it('should contain post content', () => {
      Expect.isPresent($$('.post-content').last())
    })

    it('should contain post creator', () => {
      Expect.isPresent($$('.post-creator').last())
    })

    it('should contain post type', () => {
      Expect.isPresent($$('.post-type').last())
    })

    it('should contain post location', () => {
      Expect.isPresent($$('.post-location').last())
    })

    it('should contain post creation time', () => {
      Expect.isPresent($$('.post-created-at').last())
    })

    it('should contain post category time', () => {
      Expect.isPresent($$('.post-category-name').last())
    })

    it('should show post details on click', () => {
      PostNavigator.goToPostDetails();
    })

  })
})
