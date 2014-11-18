var webdriver = require("selenium-webdriver"),
    chrome = require("selenium-webdriver/chrome"),
    helpers = {
      getWebdriver: function (browserName) {
        browserName = browserName || "PhantomJs";
        return helpers["get" + browserName]();
      },

      getPhantomJs: function () {
        return new webdriver.Builder().
            withCapabilities(webdriver.Capabilities.phantomjs()).
            build();
      },

      getFirefox: function () {
        return new webdriver.Builder().
            withCapabilities(webdriver.Capabilities.firefox()).
            build();
      },

      getChrome: function () {
        return new webdriver.Builder().
            withCapabilities(webdriver.Capabilities.chrome()).
            build();
      },

      getChromeWithVerboseLogging: function (filePath) {
        var builder = new chrome.ServiceBuilder();
        builder.enableVerboseLogging();
        builder.loggingTo(filePath || "chromedriver.log");
        var service = builder.build();
        return new chrome.Driver(null, service);
      },

      waitForPageLoadAfter: function (driver, seleniumOperation) {
        var bodyElement;
        driver.
            findElement(webdriver.By.tagName("BODY")).
            then(function (element) {
              bodyElement = element;
            });
        seleniumOperation();
        driver.wait(function () {
          return bodyElement.getAttribute("class").then(
              function () {
                return false; },
              function () {
                // better implementation:
                //   check error.message for "stale element reference: element is not attached to the page document"
                //   and reject the promise we're returning in that case
                return true;
              });
        });
      }
    };

module.exports = helpers;
