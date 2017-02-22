import {Help, Expect} from '../../../../testing/toolbox'
import {PostNavigator} from '../../../../testing/AppNavigator'
import {DatabaseHelper} from '../../../../testing/DatabaseHelper'

describe('CreatePost page', () => {
  beforeEach((done) => PostNavigator.goToCreatePostPage().then(done))
  
  afterEach(Help.clearState)

  for (var selector of ['button.select-location']) {
    it('should contain post creation furniture: ' + selector, ((selector) => {
      return (done) => {
        element(by.css(selector)).isDisplayed().then(() => {
          done()
        })
      }
    })(selector))
  }

  describe('Create an Offer post', () => {
    it('should contain a help text for offers', () => {
      var helpText:protractor.ElementFinder = element(by.id('new-post-help'));
      Expect.isPresent(helpText);
      helpText.getText().then(text => {
        expect(text.toLowerCase()).toBe('what would you like to share?');
      });
    })

    it('offer toggle should be active', () => {
      var postToggle:protractor.ElementFinder = element(by.className('segment-button segment-activated'));
      postToggle.getText().then(text => {
        expect(text.toLowerCase()).toBe('offer');
      });
    })

    it('should show the appropriate title on the dropdown button', () => {
      let dropdown:protractor.ElementFinder = $('.dropdown-button')

      Expect.isPresent(dropdown)
      dropdown.getText().then(text => {
        expect(text.toLowerCase()).toBe('how much time can you give?')
      })
    })

    it('should create a new offer post and navigate to the feed', (done) => {
      PostNavigator.createPost('This is the message', 'Fitness').then(done)
    })

    it('should show the selected "time required" on the created post', (done) => {
      browser.sleep(100).then(() => {
        return PostNavigator.createPost('I create X', 'Fitness', '1 hour')
      })
        .then(()=> {
          return browser.sleep(1000)
            .then(() => {
              return DatabaseHelper
                .runCypher('MATCH(p:Post {content: "I create X"}) RETURN p', {})
                .then((result) => {
                  return PostNavigator.goToPostDetails(result[0].postID).then(() => {
                    expect($('.post .requested-time').getText()).toBe('Offering 1 hour')
                    $('.post .content').getText().then((text) => {
                      expect(text.replace('\n', ' ')).toBe('Offer: "I create X"')
                    })
                  })
                })
                .catch(err => console.error(err))
            })
        })
        .then(done)
    })

    it('should not show "time required" when not selected on the created post', (done) => {
      PostNavigator.createPost('I create Y', 'Fitness').then(() => {
        browser.sleep(1000)
          .then(() => {
            return DatabaseHelper
              .runCypher('MATCH(p:Post {content: "I create Y"}) RETURN p', {})
              .then((result) => {
                return PostNavigator.goToPostDetails(result[0].postID).then(() => {
                  expect($('.post .requested-time').getText()).toBe('To be determined')
                  $('.post .content').getText().then((text) => {
                    expect(text.replace('\n', ' ')).toBe('Offer: "I create Y"')
                  });
                })
              })
              .catch(err => console.error(err))
          })
          .thenFinally(done)
      })
    })

  })
  
  it('should show a notification when the post was successfully stored', () => {
    PostNavigator.createPost('I create Y', 'Fitness')

    browser.wait(protractor.ExpectedConditions.visibilityOf($('#feedback')), 5000).then(() => {
      expect($('#feedback').isDisplayed()).toBeTruthy()
    })
  })

  describe('Create an Ask post', () => {
    beforeEach((done) => {
      browser.sleep(400)
        .then(() => $('.segment-button.segment-button-ask').click())
        .then(() => browser.sleep(400))
        .then(done);
    })

    it('should show the appropriate title on the dropdown button', () => {
      let dropdown:protractor.ElementFinder = $('.dropdown-button')

      Expect.isPresent(dropdown)
      dropdown.getText().then(text => {
        expect(text.toLowerCase()).toBe('how much time do you need?')
      })
    })

    it('should contain a help text for asks', () => {
      var helpText:protractor.ElementFinder = element(by.id('new-post-help'));
      Expect.isPresent(helpText);
      helpText.getText().then(text => {
        expect(text.toLowerCase()).toBe('what would you like a hand with?');
      });
    })

    it('ask toggle should be active', () => {
      var postToggle:protractor.ElementFinder = element(by.className('segment-button segment-activated'));
      postToggle.getText().then(text => {
        expect(text.toLowerCase()).toBe('ask');
      });
    })

    it('should create a new ask post', () => {
      PostNavigator.createPost('I need help with XPTO', 'Fitness')
      browser.wait(Expect.currentUrlToBe('/#/home'), 2000)
    })
  })

  describe('Add location to post', () => {

    it('should contain user\'s location as default ', () => {
      element(by.className('select-location')).getText().then((text) => {
        expect(text.toLowerCase()).toBe('lawrence township')
      })
    })

    it('should select the user\'s current location', () => {
      Help.fakeLocation(51.525503, -0.0822229)
      browser.sleep(500).then(() => {
        element(by.className('select-location')).click().then(() => {
          browser.wait(Expect.elementToBePresent(by.buttonText('Hackney, London')), 2000)
        })
      })
    })

    it('should show an alert if location is refused', () => {
      Help.fakeLocationRefusal()
      // TODO: remove sleep and wait for angular
      browser.sleep(500)
      element(by.className('select-location')).click().then(() => {
        Expect.alertWithTitle('Post location required')
      })
    })
  })
})
