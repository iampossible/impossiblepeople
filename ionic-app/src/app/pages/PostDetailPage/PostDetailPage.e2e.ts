import {AuthNavigator, PostNavigator} from '../../../testing/AppNavigator'
import {Help, Expect} from '../../../testing/toolbox'

describe('PostDetailPage', () => {

  beforeEach((done) => {
    AuthNavigator.logInValidUser().then(done)
  })

  afterEach(Help.clearState)

  describe('a specific post', () => {
    it('should contain post type', () => {
      PostNavigator.goToPostDetails('afd3eeff').then(() => {  // I´M LATE! I`m late, I`m late! I`m LATE!
        expect($('.post .post-type').getText()).toBe('Offer:')
      })
    })

    it('should contain post image if present', () => {
      PostNavigator.goToPostDetails('dfaffa58').then(() => {  // "Would you like a little more tea?"
        expect($('.post-detail-page .post-category-image').isPresent()).toBe(true)
        expect($('.post-detail-page .post-category-image').getAttribute('src')).toMatch(/build\/images\/interests/)
      })
    })
  });

  describe('report content', () => {

    beforeEach((done) => {
      return PostNavigator.goToPostDetails('dfaffa58').then(done)
    })

    it('should show notification when a post is reported', (done) => {
      var postOptionsButton = $$('ion-navbar .post-options.public').first();
      browser.wait(protractor.ExpectedConditions.elementToBeClickable(postOptionsButton), 2000).then(() => {
        return postOptionsButton.click()
      })
        .then(() => browser.sleep(400))
        .then(() => {
          let deleteButton = element(by.buttonText('Report'))
          return deleteButton.click();
        })
        .then(() => browser.sleep(200))
        .then(() => {
          return browser.wait(protractor.ExpectedConditions.visibilityOf($('#feedback')), 2000).then(() => {
            expect($('#feedback').isDisplayed()).toBeTruthy()
          })
        })
        .then(done)
    })

    it('should show notification when a comment is reported', (done) => {
      PostNavigator.swipeElementLeft('.post-comments .comment.item')
        .then(() => {
          let deleteButton = element(by.buttonText('Report'))
          return deleteButton.click();
        })
        .then(() => browser.sleep(200))
        .then(() => {
          return browser.wait(protractor.ExpectedConditions.visibilityOf($('#feedback')), 2000).then(() => {
            expect($('#feedback').isDisplayed()).toBeTruthy()
          })
        })
        .then(done)
    })

  })

  describe('every post', () => {

    beforeEach((done) => {
      return PostNavigator.goToPostDetails().then(done)
    })

    it('should contain post contents', () => {

      $('.post .content').getText().then((text) => {
        expect(text.replace('\n', ' ')).toBe('Offer: "Would you like a little more tea?"')
      });
      expect($('.post .post-location').getText()).toBe('Wonderland and far far beyond')
      expect($('.post .post-type').getText()).toBe('Offer:')
      expect($('.post .post-category-name').getText()).toBe('FOOD')
      expect($('.post .post-author-name').getText()).toBe('The Mad Hatter')
      expect($('.post .post-author-image').isDisplayed()).toBeTruthy()
    })

    describe('post author', () => {
      it('should take the user to the author profile page on click', (done) => {
        $('.post .post-author-name')
          .click()
          .then(() => {
            return Help.waitForElementToBeVisible($('.public-profile-page'))
          })
          .then(() => {
            console.log('profile visible')
            expect($('.user-name').getText()).toBe('The Mad Hatter')
            done()
          })
      })
    })

    it('should display all comments of post', () => {
      expect($$('.post-comments .comment').count()).toBe(3);
      expect($('.post-comments .comment-count').getText()).toBe('(3)');
    })

    describe('comment details', () => {
      it('should have author, date and content', () => {
        var firstComment = $$('.post-comments .comment').first();

        expect(firstComment.$('.comment-content').isPresent()).toBe(true)
        expect(firstComment.$('.comment-author-image').isPresent()).toBe(true)
        expect(firstComment.$('.comment-author').isPresent()).toBe(true)
        expect(firstComment.$('.comment-created-at-since').isPresent()).toBe(true)
      });

      it('should take you to the profile page when you tap the author image of the comment', (done) => {
        var firstComment = $$('.post-comments .comment').last();
        firstComment.$('.comment-author-image')
          .click()
          .then(() => {
            return Help.waitForElementToBeVisible($('.public-profile-page'))
          })
          .then(() => {
            console.log('profile visible')
            expect($('.user-name').getText()).toBe('White Rabbit')
            done()
          })
      })

    });

    describe('create new comments', () => {

      let commentCount;

      beforeEach((done) => {
        $$('.post-comments .comment').count().then(count => {
          commentCount = count
          PostNavigator.createComment('This is a new comment').then(done);
        });
      })

      it('should notify the user that the comment was created', () => {
        browser.wait(protractor.ExpectedConditions.visibilityOf($('#feedback')), 5000).then(() => {
          expect($('#feedback').isDisplayed()).toBeTruthy()
        })
      });

      it('should update post details with the new comment', () => {
        browser.sleep(300).then(() => {
          expect($$('.post-comments .comment').count()).toBe(commentCount + 1)
        })
      })
    })
  })
})
