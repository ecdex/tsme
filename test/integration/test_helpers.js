/*globals driver, failTestOnError */

var os = require("os"),
    fs = require("fs"),
    _ = require("lodash"),
    shell = require("shelljs"),
    SauceLabs = require("saucelabs"),
    config = require("environmental").config(),
    webdriver = require("selenium-webdriver"),
    chrome = require("selenium-webdriver/chrome"),
    helpers = {
      getWebdriver: function (browserName) {
        browserName = browserName || "phantomjs";
        return new webdriver.Builder().
            withCapabilities(webdriver.Capabilities[browserName]()).
            build();
      },

      getChromeWithVerboseLogging: function (filePath) {
        var builder = new chrome.ServiceBuilder();
        builder.enableVerboseLogging();
        builder.loggingTo(filePath || "chromedriver.log");
        var service = builder.build();
        return new chrome.Driver(null, service);
      },

      getBrowserName: function () {
        return process.env.INTEGRATION_CLIENT_BROWSER ||
        config.integration.browsername;
      },

      waitForPageLoadAfter: function (driver, seleniumOperation) {
        var bodyElement;
        driver.
            findElement(webdriver.By.tagName("BODY")).
            then(function (element) {
              bodyElement = element;
            }).
            then(null, function (err) { failTestOnError(err); });
        seleniumOperation();
        driver.wait(function () {
          return bodyElement.getAttribute("class").then(
              function () {
                return false; },
              function () {
                // better implementation:
                //   check error.message for "stale element reference: element is not attached to the page document"
                //   and reject the promise we're returning in that case
                return true;
              });
        });
      },

      failIfWebdriverBrowserLogContainsErrors: function (browserName) {
        if (browserName !== "firefox" &&            // FF logs contain non-errors
            browserName !== "internet explorer" &&  // no browser logs from webdriver on IE
            browserName !== "iPhone" &&             // or on iOS
            browserName !== "iPad") {
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
                filteredEntries = _.select(filteredEntries, function (entry) {
                  return !!entry.message;
                });

                // produce a good error message if the assert is about to fail
                if (filteredEntries.length !== 0) {
                  _.each(filteredEntries, function (entry) {
                    console.log(entry.message);
                  });
                }
                filteredEntries.length.should.equal(0);
              }).
          then(null, function (err) { failTestOnError(err); });
        }
      },

      // the Sauce Labs helper is comparatively huge, so it's last
      getSauce: function () {
        // stop run unless it looks like Sauce Connect is running
        //    /tmp default for local & Travis CI.  Pull request to generalize welcome.
        var tmpDirListing = fs.readdirSync("/tmp"),
            scPidFile = _.select(tmpDirListing, function (fileName) {
              return /^sc_client.*\.pid$/.test((fileName));
            });
        if (scPidFile.length < 1) {
          throw new Error(
              "Can't find a Sauce Connect PID file (/tmp/sc_client*.pid).  " +
              "Stopping because we'll fail anyway if sc isn't running");
        }

        var sauce = "http://ondemand.saucelabs.com:80/wd/hub",
            configString = process.env.SAUCE_CONFIG_JSON.replace(/\\x3A/g, ":"),
            config = JSON.parse(configString),
            sauceParams = {
              username: process.env.SAUCE_USERNAME,
              accessKey: process.env.SAUCE_ACCESS_KEY
            },
            browserName = config.browserName;
        process.env.INTEGRATION_CLIENT_BROWSER = browserName;


        // get webdriver instance connected to Sauce Labs
        if (process.env.TRAVIS_JOB_NUMBER) {
          sauceParams["tunnel-identifier"] = process.env.TRAVIS_JOB_NUMBER;
        }
        var driver = new webdriver.Builder().
            usingServer(sauce).
            withCapabilities(_.merge(config, sauceParams)).
            build();


        // populate Sauce Labs jobInfo from dev environment or Travis
        driver.getSession().then(function (session) {
          var hostname = os.hostname(),
              saucelabs = new SauceLabs({
                username: process.env.SAUCE_USERNAME,
                password: process.env.SAUCE_ACCESS_KEY
              }),
              sessionId = process.env.SAUCE_SESSION_ID = session.getId(),
              jobInfo = {
                name: "tsme sauce integration",
                tags: [browserName],
                "custom-data": {}
              };

          if (process.env.HAS_JOSH_K_SEAL_OF_APPROVAL) {
            jobInfo.tags.push("travis");
            jobInfo["custom-data"]["travis-hostname"] = hostname;
          } else {
            jobInfo.tags.push(hostname);
          }
          if (process.env.TRAVIS_BUILD_NUMBER) {
            jobInfo.build = parseInt(process.env.TRAVIS_BUILD_NUMBER, 10);
          }

          if (!process.env.TRAVIS_BRANCH) {
            var regex = /^\* (.+)$/,
                branchList = shell.exec("git branch --no-color", { silent: true }).output,
                branches = branchList.split("\n"),
                current = _.first(_.select(branches, function (line) {
                  return regex.test(line);
                })),
                branch = regex.exec(current)[1];
            jobInfo.tags.push(branch);
          }
          _.each(["TRAVIS_BRANCH", "TRAVIS_TAG"], function (envVar) {
            if (process.env[envVar]) {
              jobInfo.tags.push(process.env[envVar]);
            }
          });

          _.each([
            "TRAVIS_PULL_REQUEST", "TRAVIS_COMMIT", "TRAVIS_COMMIT_RANGE",
            "TRAVIS_JOB_NUMBER", "TRAVIS_NODE_VERSION"
          ], function (envVar) {
            if (process.env[envVar]) {
              var key = envVar.toLowerCase().replace(/_/g, "-");
              jobInfo["custom-data"][key] = process.env[envVar];
            }
          });


          saucelabs.updateJob(sessionId, jobInfo, function () {});
        });

        return driver;
      }
    };

module.exports = helpers;
