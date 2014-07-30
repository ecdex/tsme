var express = require('express'),
    markdown = require('markdown'),
    when = require('when');

function init(options) {
  var app = express(),
      deferred = when.defer(),
      serverFactory = require('./core/server');

  options.app = app;
  serverFactory(options)
      .then(function(server) {
        deferred.resolve(app);
      })
      .catch(function(failureMessage) {
        deferred.reject(failureMessage);
      });

  return deferred.promise;
}

module.exports = init;
