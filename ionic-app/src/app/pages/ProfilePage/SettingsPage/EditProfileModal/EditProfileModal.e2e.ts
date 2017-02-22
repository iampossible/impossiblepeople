import {Expect, Interact, Help} from '../../../../../testing/toolbox'
import {ProfileNavigator} from '../../../../../testing/AppNavigator'
import {DatabaseHelper} from '../../../../../testing/DatabaseHelper';

describe('EditProfileModal', () => {
  var currentLocation: string

  beforeEach((done) => {
    ProfileNavigator.goToProfilePage().then(() => {
      ProfileNavigator.editProfile().then(() => {
        DatabaseHelper.runCypher(
          'MATCH (user:Person { userID: {userID} }) RETURN user',
          { userID: 'e52c854d' } // Demo User
        ).then((result: Array<any>) => {
          currentLocation = result[0].location
          done()
        }).catch((error) => {
          console.error(error)
          done()
        })
      })
    })
  })

  afterEach(Help.clearState)

  describe('edit profile picture', () => {
    var buttonLocator = by.buttonText('Update profile picture')

    it('should contain the profile picture and an update profile picture button', () => {
      browser.wait(Expect.elementToBePresent(by.css('.profile-picture')), 2000)
      browser.wait(Expect.elementToBePresent(buttonLocator), 2000)
    })

    it('should allow the user to choose a picture source', () => {
      browser.wait(Expect.elementToBePresent(buttonLocator), 2000)
      // TODO I mean seriously
      browser.sleep(500)
      element(buttonLocator).click()
      Expect.alertWithTitle('Choose an image')
    })
  })

  describe('edit name, bio and url', () => {
    it('should contain the default values', () => {
      expect($('.profile-first-name input').getAttribute('value')).toBe("Demo")
      expect($('.profile-last-name input').getAttribute('value')).toBe("User")
      expect($('.profile-bio input').getAttribute('value')).toBe("Just some user, you know?")
      expect($('.profile-url input').getAttribute('value')).toBe("http://township.me/")
    })

    it('should update name, biography and url when the user presses "save"', (done) => {
      ProfileNavigator.changeName("Demo", "Nick").then(() => {
        ProfileNavigator.changeBiography('Everything is shite').then(() => {
          ProfileNavigator.changeUrl('Everything is shite').then(() => {
            ProfileNavigator.saveProfile().then(() => {
              browser.wait(protractor.ExpectedConditions.textToBePresentInElement($('.settings-page .user-name'), 'Demo Nick')).then(() => {
                expect($('.settings-page .user-biography').getText()).toBe('Everything is shite')
                expect($('.settings-page .user-url').getText()).toBe('http://me.township/')
                done()
              })
            })
          })
        })
      })
    })

    it('should persist the user data change in the public profile', (done) => {
      ProfileNavigator.changeName("Demo", "Guy")
        .then(() => ProfileNavigator.changeBiography('Everything is awesome'))
        .then(() => ProfileNavigator.changeUrl('http://everything.awesome/'))
        .then(() => ProfileNavigator.saveProfile())
        .then(() => $$('.back-button').last().click())
        .then(() => browser.wait(protractor.ExpectedConditions.visibilityOf($('.public-profile-page')), 2000))
        .then(() => {
          expect($('.public-profile-page .user-name').getText()).toBe('Demo Guy')
          expect($('.public-profile-page .user-biography').getText()).toBe('Everything is awesome')
          expect($('.public-profile-page .user-url').getText()).toBe('http://everything.awesome/')
          done()
        })
    })

    it('should contain the current location', () => {
      browser.wait(Expect.elementToBePresent(by.buttonText(currentLocation)), 2000)
    })

    it('should allow editing of current location', () => {
      Help.fakeLocation(51.525503, -0.0822229)
      browser.sleep(500).then(() => {
        element(by.buttonText(currentLocation)).click().then(() => {
          browser.wait(Expect.elementToBePresent(by.buttonText('Hackney, London')), 2000)
        })
      })

    })

    it('should show an alert if location is refused', () => {
      Help.fakeLocationRefusal()
      browser.sleep(500)
      Interact.clickOn(element(by.buttonText(currentLocation)))
      Expect.alertWithTitle('Failed to update location')
    })
  })
})
