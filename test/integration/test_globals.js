/*globals before, after */
/*jshint expr:true*/

require("should");
var config = require("environmental").config(),
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

  helpers.failIfWebdriverBrowserLogContainsErrors(browserName);

  driver.
      quit().
      then(function () { done(); });//.
      //then(null, function (err) { failTestOnError(err); });
});
