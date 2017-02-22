import {ElementFinder} from 'protractor'
import {Locator} from 'selenium-webdriver'

export class Expect {

  /**
   * Wait for the URL to match the supplied regex
   *
   * @param {RegExp} pattern
   * @return {Function}
   */
  static currentUrlToMatch(pattern:RegExp) {
    return () => {
      return browser.getCurrentUrl().then(url => {
        return pattern.test(url)
      })
    }
  }

  /**
   * Wait for the URL to become the expected value
   *
   * @param {String} url
   * @return {Function}
   */
  static currentUrlToBe(url:String) {
    return () => {
      return browser.getCurrentUrl().then(
        (currentUrl) => {
          return currentUrl == browser.baseUrl + url
        }
      )
    }
  }

  /**
   * Assert an appropriate number of an element
   *
   * @count number to expect
   * @locator element to locate and count
   */
  static elementCountToBe(count:Number, locator:Locator) {
    return () => element.all(locator).count().then((number) => number === count)
  }

  /**
   * Assert an appropriate number of an element
   *
   * @minimum number to expect
   * @locator element to locate and count
   */
  static elementCountToBeAtLeast(minimum:Number, locator:Locator) {
    return () => element.all(locator).count().then((number) => number >= minimum)
  }

  static elementToBePresent(locator:Locator) {
    return () => element.all(locator).first().isPresent()
  }

  /**
   * gets the value of 'scrollTop' and parses it to INT
   * @param element ElementFinder
   * @returns {jasmine.Matchers}
   */
  static elementScroll(element:ElementFinder) {
    return expect(element.getAttribute('scrollTop').then(value => parseInt(value, 10)))
  }

  /**
   * Assert an element is present
   *
   * @param element under test
   */
  static isPresent(element:ElementFinder) {
    element.isPresent().then(elementIsPresent => {
      expect(elementIsPresent).toBeTruthy()
    })
  }

  /**
   * Wait for an element matching the selector to be present
   *
   * @param selector: The CSS selector
   * @returns {function(): undefined}
   */
  static selectorToBePresent(selector:string) {
    return () => element(by.css(selector)).isPresent().then(elementPresent => elementPresent)
  }

  /**
   * asserts an ionic alert is present and has the supplied title
   * @param  {string} alertTitle title to check
   * @return {void}
   */
  static alertWithTitle(alertTitle:string) {
    return browser
      .wait(protractor.ExpectedConditions.visibilityOf($('ion-alert > .alert-wrapper')), 2000)
      .then(() => {
        expect($('.alert-title').getText()).toEqual(alertTitle)
      })
  }

  static errorMessage(message:string) {
    return browser
      .wait(protractor.ExpectedConditions.visibilityOf($('.error-message')), 2000)
      .then(() => {
        expect($('.error-message').getText()).toBe(message)
      })
  }
}
