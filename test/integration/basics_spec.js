/*globals driver, describe, it */
/*jshint expr:true*/

var config = require("environmental").config();

describe("server", function () {
  it("responds to GET of root", function (done) {
    var rootPath = config.integration.root;

    driver.get("http://localhost:3000" + rootPath);
    driver.
        wait(function () {
          return driver.
              getPageSource().
              then(function (content) {
                return content.indexOf("world") > -1;
              });//.
              //then(null, function (err) { failTestOnError(err); });
        }, 5000).
        then(function () { done(); });//.
        //then(null, function (err) { failTestOnError(err); });
  });
});
