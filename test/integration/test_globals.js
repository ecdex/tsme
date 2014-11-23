/*globals before, after */
/*jshint expr:true*/

require("should");
var helpers = require("./test_helpers");

/*globals driver: true */
driver = null;

// some exceptions from inside webdriver.js operations were getting
// eaten by the absence of an error callback, so this function is
// intended to be used as the error handler in a driver.next() call
// or in the terminal .next() of a webdriver promise chain.  Forces
// the exception to force at test failure, sometimes at the cost of
// printing duplicate stack traces.  Also cleanly done()'s the caller
// in the case of errors, which also sometimes wouldn't happen.
//
/*globals failTestOnError: true */
failTestOnError = function (err, done) {
  console.log("  -------->  FAILED");
  console.log(err.stack);
  err.message.should.equal("");   // force test failure with mismatch printing message

  if (done) {
    done();
  }
};

before(function () {
  var browserName = helpers.getBrowserName();

  //  -- for debug
  //driver = helpers.getChromeWithVerboseLogging();
  //return;

  if (process.env.INTEGRATION_CLIENTS_LOCATION === "sauce") {
    driver = helpers.getSauce();     // browser config from environment
  } else {   // "local"
    driver = helpers.getWebdriver(browserName);
  }
});

after(function (done) {
  if (!driver) {
    done();
    return;
  }

  var browserName = helpers.getBrowserName();
  helpers.failIfWebdriverBrowserLogContainsErrors(browserName);
  driver.
      quit().
      then(function () { done(); }).
      then(null, function (err) { failTestOnError(err, done); });
});
