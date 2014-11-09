var path = require("path"),
    rewire = require("rewire");

/*global rewireInApp: true */
rewireInApp = function (appRelativePath) {
  return rewire(path.join(__dirname, "..", "..", "app", appRelativePath));
};

/*global buildFailureOnCall: true */
buildFailureOnCall = function (done, msg) {
  return function () {
    done(new Error(msg));
  };
};
