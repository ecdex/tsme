/*globals driver, failTestOnError */
/*jshint expr:true*/

var test = require("../../node_modules/quick-grunt-config-mocha-sauce/node_modules/selenium-webdriver/testing"),
    config = require("environmental").config();

test.describe("rendering of page content", function () {
  test.it("pages contain content from their markdown plus their template's markdown", function () {
    var rootPath = config.integration.root;

    driver.get("http://localhost:3000" + rootPath + "some-page");
    driver
        .wait(function () {
          return driver.
              getPageSource().
              then(function (content) {
                return (
                    /<p>This page.\s+Is a page.<\/p>/i.test(content) &&
                    /<p><a href="\/about">About page<\/a><\/p>/i.test(content)
                );
              }).
              then(null, function (err) { failTestOnError(err); });
        }, 5000)
        .then(null, function (err) { failTestOnError(err); });
  });
});
