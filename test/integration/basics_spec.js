
var webdriver = require('selenium-webdriver'),
    config = require("environmental").config();

describe("local test server", function (done) {
  it("responds to GET of root", function (done) {
    var rootPath = config.integration.root;

    driver.get('http://localhost:3000' + rootPath);
    driver.
        wait(function () {
          return driver.getPageSource().then(function (content) {
            return content.indexOf('world') > -1;
          });
        }, 5000).
        then(function () { done(); });
  });
});
