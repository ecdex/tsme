
var SauceLabs = require("saucelabs"),
    Base = require("mocha/lib/reporters/base");

function SauceNotifyingReporter(runner) {
  Base.call(this, runner);

  runner.on("end", function () {
    var sessionId = process.env.SAUCE_SESSION_ID,
        passed = this.stats.failures === 0,
        saucelabs = new SauceLabs({
          username: process.env.SAUCE_USERNAME,
          password: process.env.SAUCE_ACCESS_KEY
        });

    saucelabs.updateJob(
        sessionId,
        { passed: passed },
        function () {}
    );
  });
}

SauceNotifyingReporter.prototype = Object.create(Base.prototype);
SauceNotifyingReporter.prototype.constructor = SauceNotifyingReporter;

module.exports = SauceNotifyingReporter;
