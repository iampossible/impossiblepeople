import {ElementFinder} from 'protractor'

export class Interact {

  /**
   * Waits for ionic alert to appear and clicks "ok"
   *
   * @return {void}
   */
  static clickAlertOK() {
    return browser
      .wait(protractor.ExpectedConditions.visibilityOf($('ion-alert > .alert-wrapper')), 2000)
      .then(() => $('.alert-button').click())
  }

  /**
   * Type each character separately to avoid unpleasantness
   *
   * @param {protractor.ElementFinder} element
   * @param {string} word
   * @return {void}
   */
  static typeInto(element:ElementFinder, word:string) {
    return element.clear().then(() => {
      for (var char of word.split('')) {
        element.sendKeys(char)
      }

      return browser.wait(protractor.ExpectedConditions.textToBePresentInElementValue(element, word), 2000)
    })
  }

  /**
   * For some reason, .click() doesn't work but sending an Enter keypress does
   *
   * @param {protractor.ElementFinder} element
   * @return {void}
   */
  static clickOn(element:ElementFinder) {
    return element.sendKeys(protractor.Key.ENTER)
  }

  /**
   * Scrolls and Element to a location
   *
   * @param element ElementFinder
   * @param value scrollTop value
   * @returns {webdriver.promise.Promise<void>}
   */
  static scrollDown(element:ElementFinder, value:number) {
    return browser
      .executeScript(`arguments[0].scrollTop = ${value};`, element.getWebElement())
      .then(() => browser.sleep(50));
  }
}
