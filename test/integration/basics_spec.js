/*globals driver, failTestOnError */
/*jshint expr:true*/

var test = require("../../node_modules/quick-grunt-config-mocha-sauce/node_modules/selenium-webdriver/testing"),
    config = require("environmental").config();

test.describe("server", function () {
  test.it("responds to GET of root", function () {
    var rootPath = config.integration.root;

    driver.get("http://localhost:3000" + rootPath);
    driver
        .wait(function () {
          return driver.
              getPageSource().
              then(function (content) {
                return content.indexOf("world") > -1;
              }).
              then(null, function (err) { failTestOnError(err); });
        }, 5000)
        .then(null, function (err) { failTestOnError(err); });
  });
});
