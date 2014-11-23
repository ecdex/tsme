var _ = require("lodash");

function loadInstallTasks(grunt) {
  // unit tests
  grunt.registerTask("test-unit", "run automated unit tests (mocha)",
      ["environmental:test", "mochacli:unit"]);


  // run integration tests using default browser for both server configs
  // used by the default "test" task, and therefore by CI
  grunt.registerTask("test-integration-server",
      "run automated integration tests (locally, default live browser) against tsme as stand-alone server",
      ["environmental:test:server", "env:local", "express:test-server", "mochacli:integration", "express:test-server:stop"]);
  grunt.registerTask("test-integration-middleware",
      "run automated integration tests (locally, default live browser) against tsme as a middleware module",
      ["environmental:test:middleware", "env:local", "express:test-middleware", "mochacli:integration", "express:test-middleware:stop"]);
  grunt.registerTask("test-integration", "run automated integration tests (local, default live browser)",
      ["test-integration-server", "test-integration-middleware"]);


  var description = "run integration tests, server and middleware, sequentially for each local browser config",
      browserNames = ["phantomjs", "chrome", "firefox"],
      testTargets  = ["server", "middleware"],
      environments = {
        server:     { INTEGRATION_ROOT: "/" },
        middleware: { INTEGRATION_ROOT: "/subsite/" }
      },
      crossProduct = [];

  _.each(testTargets, function (target) {
    _.each(browserNames, function (browserName) {
      var environmentName = target + "-" + browserName,
          taskName = "integrate-" + environmentName;

      crossProduct.push(taskName);
      environments[environmentName] = _.merge(
          { INTEGRATION_BROWSERNAME: browserName },
          environments[target]
      );

      grunt.registerTask(taskName,
          "run integration tests for " + target + " in " + browserName,
          [
            "environmental:test:" + environmentName,
            "env:local",
            "express:test-" + target,
            "mochacli:integration",
            "express:test-" + target + ":stop"
          ]
      );
    });
  });
  grunt.registerTask("integrate-local", description, crossProduct);


  grunt.registerTask(
      "integrate-sauce",
      "run integration tests on middleware config via remote browsers at Sauce Labs",
      function () {
        var configString,
            sauceConfigs = require("../../.sauce-configs.js"),
            focusString = process.env.INTEGRATION_FOCUS,
            focusRe = focusString ? new RegExp(focusString) : null;

        grunt.task.run(
            "express:test-middleware",
            "environmental:test:middleware",
            "env:sauce"
        );

        _.each(_.keys(sauceConfigs), function (browserName) {
          _.each(sauceConfigs[browserName], function (configHash) {
            configHash.browserName = browserName;
            configString = JSON.stringify(configHash);

            if (!focusRe || focusRe.test(configString)) {
              grunt.task.run(
                  "set-sauce-config:" +
                  configString.replace(/:/g, "\\x3A"),
                  "mochacli:integration"
              );
            }
          });
        });

        grunt.task.run("express:test-middleware:stop");
      });

  grunt.registerTask(
      "set-sauce-config",
      "put the task's target (assumed to be a JSON string) int the environment variable SAUCE_CONFIG_JSON",
      function (target) {
        process.env.SAUCE_CONFIG_JSON = target;
      }
  );



  return {
    express: {
      "test-server": {
        options: {
          script: "server.js",
          output: "Express server listening"
        }
      },
      "test-middleware": {
        options: {
          script: "test/fixtures/middleware_test_server/index.js",
          output: "Test application is listening"
        }
      }
    },

    env: {
      local: { INTEGRATION_CLIENTS_LOCATION: "local" },
      sauce: {
        INTEGRATION_CLIENTS_LOCATION: "sauce",
        multi: "spec=- ../../build_components/mocha/sauce_notifying_reporter=-"
      }
    },

    environmental: {
      options: {
        inject: environments
      }
    },

    mochacli: {
      options: {
        "check-leaks": true
      },
      unit: { options: {
        filesRaw: ["test/unit/**/*_globals.js", "test/unit/**/*_spec.js"]
      } },
      integration: { options: {
        filesRaw: ["test/integration/**/*_globals.js", "test/integration/**/*_spec.js"]
      } }
    }
  };
}

module.exports = loadInstallTasks;
