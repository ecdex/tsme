var _ = require("lodash");

function loadInstallTasks(grunt) {
  // unit tests
  grunt.registerTask("test-unit", "run automated unit tests (mocha)",
      ["environmental:test", "mochacli:unit"]);


  // run integration tests using default browser for both server configs
  // used by the default "test" task, and therefore by CI
  grunt.registerTask("test-integration-server",
      "run automated integration tests (default live browser) against tsme as stand-alone server",
      ["environmental:test:server", "express:test-server", "mochacli:integration", "express:test-server:stop"]);
  grunt.registerTask("test-integration-middleware",
      "run automated integration tests (default live browser) against tsme as a middleware module",
      ["environmental:test:middleware", "express:test-middleware", "mochacli:integration", "express:test-middleware:stop"]);
  grunt.registerTask("test-integration", "run automated integration tests (default live browser)",
      ["test-integration-server", "test-integration-middleware"]);


  var description = "run integration tests sequentially for each supported browser",
      browserNames = ["Chrome", "Firefox", "PhantomJs"],
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
            "express:test-" + target,
            "mochacli:integration",
            "express:test-" + target + ":stop"
          ]
      );
    });
  });
  grunt.registerTask("integrate", description, crossProduct);


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
