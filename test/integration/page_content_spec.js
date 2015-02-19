/*globals driver, failTestOnError, describe, it */
/*jshint expr:true*/

var config = require("environmental").config();

describe("rendering of page content", function () {
  it("pages contain content from their markdown plus their template's markdown", function (done) {
    var rootPath = config.integration.root;

    driver.get("http://localhost:3000" + rootPath + "some-page");
    driver.
        wait(function () {
          return driver.
              getPageSource().
              then(function (content) {
                return (
                    /<p>This page.\s+Is a page.<\/p>/i.test(content) &&
                    /<p><a href="\/about">About page<\/a><\/p>/i.test(content)
                );
              }).
              then(null, function (err) { failTestOnError(err, done); });
        }, 5000).
        then(function () { done(); }).
        then(null, function (err) { failTestOnError(err, done); });
  });
});
