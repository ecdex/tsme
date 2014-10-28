console.log(Promise);
var express = require("express");
    // Promise = require("bluebird");

function init(options) {
  var app = express(),
      deferred = Promise(),
      serverFactory = require("./core/server");

  options.app = app;
  serverFactory(options)
      .then(function (server) {
        deferred.resolve(app);
      })
      .catch(function (failureMessage) {
        deferred.reject(failureMessage);
      });

  return deferred.promise;
}

module.exports = init;
