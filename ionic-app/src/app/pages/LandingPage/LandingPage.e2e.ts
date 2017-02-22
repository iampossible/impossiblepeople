'use strict'

import {Expect, Help, Interact} from '../../../testing/toolbox'
import {LandingPageNavigator} from '../../../testing/AppNavigator'
import {AuthNavigator} from '../../../testing/navigators/AuthNavigator'

describe('Landing Page', () => {
  const logInButton = $('.log-in-button')

  beforeEach(() => LandingPageNavigator.goToLandingPage())

  afterEach(Help.clearState)

  it('should contain login and create account buttons', () => {

    expect(logInButton.isDisplayed()).toBeTruthy()
    expect(element(by.buttonText('Sign up with email')).isDisplayed()).toBeTruthy()
  })

  describe('Login button', () => {
    it('should take the user to the auth page', () => {
      Interact.clickOn(logInButton)
      browser.wait(Expect.currentUrlToMatch(/\/#\/user\/auth$/), 2000)
    })
  })

  describe('Create account button', () => {
    it('should take the user to the account creation page', () => {
      Interact.clickOn(element(by.buttonText('Sign up with email')))
      browser.wait(Expect.currentUrlToMatch(/\/#\/user\/create$/), 2000)
    })
  })

  it('should redirect to landing page if user tries to access a page for which authorisation is required', (done) => {
    browser.get('/#/home')
      .then(() => browser.sleep(12000))
      .then(() => {
        return browser.wait(Expect.currentUrlToBe('/'), 12000).then(done)
      })
  })

  it('should redirect to feed if user has already logged in', (done) => {
    AuthNavigator.logInAlice()
      .then(() => {
        return browser.get('')
      })
      .then(() => browser.sleep(12000))
      .then(() => {
        return $('.feed-tab').isDisplayed().then(displayed => {
          return expect(displayed).toBeTruthy()
        })
      })
      .then(done)
  })
})
