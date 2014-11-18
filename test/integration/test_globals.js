/*globals before, after */
/*jshint expr:true*/

var webdriver = require("selenium-webdriver"),
    should = require("should"),                           // jshint ignore:line
    _ = require("lodash"),
    config = require("environmental").config(),
    helpers = require("./test_helpers");

/*globals driver: true */
driver = "is global";

before(function () {
      // use either one
  driver = helpers.getWebdriver(config.integration.browsername);
  //driver = helpers.getChromeWithVerboseLogging();
});

after(function (done) {
  if (config.integration.browsername !== "Firefox") {  // FF logs contain non-errors
    driver.manage().logs().get(webdriver.logging.Type.BROWSER).then(function (logEntries) {
      var filteredEntries = logEntries;
      if (config.integration.browsername === "PhantomJs") {
        // phantom doesn't trigger onload events on completion of fetch for LINK elements,
        // so we incorrectly report failure on CSS file loads
        filteredEntries = _.reject(logEntries, function (entry) {
          return /Error: didn't load asset nicknamed '.*-css'/.test(entry.message);
        });
      }

      // produce a good error message if the assert is about to fail
      if (filteredEntries.length !== 0) {
        _.each(filteredEntries, function (entry) {
          console.log(entry.message);
        });
      }
      filteredEntries.length.should.equal(0);
    });
  }

  driver.
      quit().
      then(function () { done(); });
});
