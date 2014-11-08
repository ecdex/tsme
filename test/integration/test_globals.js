
var webdriver = require('selenium-webdriver'),
    helpers = require('./test_helpers');

driver = 'is global';

before(function () {
      // use either one
  driver = helpers.getWebdriver();
  //driver = helpers.getChromeDriverWithVerboseLogging();
});

after(function (done) {
  driver.
      quit().
      then(function () { done(); });
});
