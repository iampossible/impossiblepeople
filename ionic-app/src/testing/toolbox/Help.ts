export class Help {

  static fakeLocation(latitude:number, longitude:number) {
    browser.executeScript(`\
            window.navigator.geolocation.getCurrentPosition = \
                function(success){ \
                    var position = { \
                        "coords" : { \
                            "latitude": "${latitude}", "longitude": "${longitude}" \
                        } \
                    }; \
                    success(position); \
                }`)
  }

  static fakeLocationRefusal() {
    browser.executeScript(
      'window.navigator.geolocation.getCurrentPosition = function (success, failure) { failure({"code":1,"message":""}) }'
    )
  }

  static waitForElementToBeVisible(element:protractor.ElementFinder) {
    return browser.wait(protractor.ExpectedConditions.visibilityOf(element), 2000, 'some wait')
  }
  
  static clearState(done) {
    browser.executeScript('window.localStorage.clear();').then(() => {
      return browser.manage().deleteAllCookies()
    }).then(done)
  }

  static clearBanners() {
    return browser.executeScript('["topBannerSeen", "introSeen"].forEach(i => window.localStorage.removeItem(i));');
  }

  static triggerIonicEvent(topic, payload) {
    browser.executeScript(`window.testing.trigger("${topic}", ${JSON.stringify(payload)})`)
  }
}
