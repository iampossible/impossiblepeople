import {Expect, Help} from '../../../../testing/toolbox'
import {AuthNavigator} from '../../../../testing/AppNavigator'
import {DatabaseHelper} from '../../../../testing/DatabaseHelper';

describe('AddLocationContextPage', () => {

  beforeEach((done) => AuthNavigator.logInQueenOfHearts().then(done))

  afterEach(Help.clearState)

  afterAll((done) => DatabaseHelper.runCypher(
    'MATCH (p:Person { email: "queen@hearts.cards" }) SET p.location = null, p.latitude = null, p.longitude = null;', {}
  ).then(done))

  describe('Skipping location', () => {
    it('should send the user to the feed', (done) => {
      element(by.css('.skip-location')).click().then(() => {
        return browser.wait(Expect.currentUrlToMatch(/\/#\/home$/), 2000)
      }).then(done)
    })
  })

  describe('Sharing location', () => {
    let locator = by.css('.share-location')

    it('should show the user a warning if they share their location but deny access', (done) => {
      Help.fakeLocationRefusal()
      element(locator).click().then(() => {
        return Expect.alertWithTitle('Failed to update location')
      }).then(done)
    })

    it('should send the user to the feed if they share their location and allow access', (done) => {
      Help.fakeLocation(51.526, -0.088)
      element(locator).click().then(() => {
        return browser.wait(Expect.currentUrlToMatch(/\/#\/home$/), 2000)
      }).then(done)
    })
  })
})