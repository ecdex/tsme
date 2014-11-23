/*globals before, after */
/*jshint expr:true*/

require("should");
var helpers = require("./test_helpers");

/*globals driver: true */
driver = null;

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
      then(function () { done(); });//.
      //then(null, function (err) { failTestOnError(err); });
});
