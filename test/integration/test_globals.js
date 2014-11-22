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
  //  -- for debug
  //driver = helpers.getChromeWithVerboseLogging();
  //return;

  if (process.env.TSME_INTEGRATION_CLIENTS === "sauce") {
    driver = helpers.getSauce();     // browser config from environment
  } else {   // "local"
    driver = helpers.getWebdriver(
        process.env.TSME_INTEGRATION_CLIENT_BROWSER ||
        config.integration.browsername
    );
  }
});

after(function (done) {
  if (config.integration.browsername !== "firefox") {  // FF logs contain non-errors
    driver.manage().logs().get(webdriver.logging.Type.BROWSER).then(function (logEntries) {
      var spuriousCssLoadFailures = [
            // these browsers don't trigger onload events on completion of fetch
            // for LINK elements, so we incorrectly report failure on CSS file loads
            "phantomjs", "android"
          ],
          filteredEntries = logEntries;

      if (_.indexOf(spuriousCssLoadFailures, config.integration.browsername) !== -1) {
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
