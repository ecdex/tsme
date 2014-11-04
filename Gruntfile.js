var _ = require("lodash");

function configureGrunt(grunt) {
  require("matchdep").filterDev(["grunt-*", "!grunt-cli"]).forEach(grunt.loadNpmTasks);

  var lintableFiles = {
    app: {
      files: {
        src: [
          "*.js",
          "app/**/*.js"
        ]
      }
    },
    test: {
      files: {
        src: [
          "test/**/*.js"
        ]
      }
    }
  };

  grunt.initConfig({
    jshint: _.merge({
      options: {
        jshintrc: ".jshintrc"
      }
    }, lintableFiles),
    jscs: _.merge({
      app: { options: {} },
      test: { options: {} }
    }, lintableFiles),

    express: {
      test: {
        options: {
          script: "index.js",
          output: "Express server listening"
        }
      }
    },

    mochacli: {
      unit: {
        options: {
          filesRaw: ["test/*.js", "test/unit/**/*.js"],
          "check-leaks": true
        }
      }
    }
  });

  grunt.registerTask("test", "run automated tests", ["environmental:test", "mochacli:unit"]);
  grunt.registerTask("validate", "run all the checks and tests",
      ["jshint", "jscs", "test"]);
  grunt.registerTask("default", "install, test, and run", ["validate"]);
}

// Export the configuration
module.exports = configureGrunt;
