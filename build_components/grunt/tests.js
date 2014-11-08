
function loadInstallTasks(grunt) {
  grunt.registerTask("test-unit", "run automated unit tests (mocha)",
      ["environmental:test", "mochacli:unit"]);

  grunt.registerTask("test-integration-server",
      "run automated integration tests (live browser, chromedriver) against tsme as stand-alone server",
      ["environmental:test:stand-alone", "express:test-server", "mochacli:integration", "express:test-server:stop"]);
  grunt.registerTask("test-integration-middleware",
      "run automated integration tests (live browser, chromedriver) against tsme as a middleware module",
      ["environmental:test:middleware", "express:test-middleware", "mochacli:integration", "express:test-middleware:stop"]);
  grunt.registerTask("test-integration", "run automated integration tests (live browser, chromedriver)",
      ["test-integration-server", "test-integration-middleware"]);

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
        inject: {
          "stand-alone": { INTEGRATION_ROOT: "/" },
          middleware:    { INTEGRATION_ROOT: "/subsite/" }
        }
      }
    },

    mochacli: {
      options: {
        "check-leaks": true
      },
      unit: { options: {
        filesRaw: ["test/unit/**/*_helper.js", "test/unit/**/*_spec.js"]
      } },
      integration: { options: {
        filesRaw: ["test/integration/**/*_globals.js", "test/integration/**/*_spec.js"]
      } }
    }
  };
}

module.exports = loadInstallTasks;
