/*globals before, after */
/*jshint expr:true*/

require("should");
var webdriver = require("selenium-webdriver"),
    _ = require("lodash"),
    config = require("environmental").config(),
    helpers = require("./test_helpers");

/*globals driver: true */
driver = "is global";

//globals failTestOnError: true */
//function failTestOnError(err) {
//  if (err.name === "AssertionError") { throw err; }
//
//  console.log("  -------->  FAILED");
//  console.log(err.toString());
//  console.log(err.stack);
//  err.message.should.equal("");   // force test failure with mismatch printing message
//}

before(function () {
  var browserName = process.env.TSME_INTEGRATION_CLIENT_BROWSER ||
      config.integration.browsername;

  //  -- for debug
  //driver = helpers.getChromeWithVerboseLogging();
  //return;

  if (process.env.TSME_INTEGRATION_CLIENTS === "sauce") {
    driver = helpers.getSauce();     // browser config from environment
  } else {   // "local"
    driver = helpers.getWebdriver(browserName);
  }
});

after(function (done) {
  var browserName = process.env.TSME_INTEGRATION_CLIENT_BROWSER ||
      config.integration.browsername;

  if (browserName !== "firefox" &&            // FF logs contain non-errors
      browserName !== "internet explorer") {  // no browser logs from webdriver on IE
    driver.manage().logs().
        get(webdriver.logging.Type.BROWSER).
        then(function (logEntries) {
          var spuriousCssLoadFailures = [
                // these browsers don't trigger onload events on completion of fetch
                // for LINK elements, so we incorrectly report failure on CSS file loads
                "phantomjs", "android"
              ],
              filteredEntries = logEntries;

          if (_.indexOf(spuriousCssLoadFailures, browserName) !== -1) {
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
        });//.
        //then(null, function (err) { failTestOnError(err); });
  }

  driver.
      quit().
      then(function () { done(); });//.
      //then(null, function (err) { failTestOnError(err); });
});
