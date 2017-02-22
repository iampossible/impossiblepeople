export class NavigatorHelper {

  /**
   * Accesses supplied destination, and blocks further execution until the supplied locator is present
   * @param destination
   * @param locator
   */
  public static goToPath(destination:string, locator:any) {
    browser.get(destination)
    return browser.wait(protractor.ExpectedConditions.visibilityOf(element(locator)), 2000)
  }

}