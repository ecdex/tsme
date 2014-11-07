var _ = require("lodash"),
    path = require("path");

function requireComponent(componentName) {
  return require("./" + path.join("build_components", "grunt", componentName));
}

function configureGrunt(grunt) {
  require("matchdep").filterDev(["grunt-*", "!grunt-cli"]).forEach(grunt.loadNpmTasks);

  var configuration = {};
  _.merge(configuration, requireComponent("coding_standards")(grunt));
  _.merge(configuration, requireComponent("tests")(grunt));
  _.merge(configuration, requireComponent("install")(grunt));

  grunt.registerTask("validate", "run all the checks and tests",
      [
        "jshint", "jscs",                  // coding_standards
        "test-unit", "test-integration"    // tests
      ]);
  // remember, 'test' is the primary continuous-integration build target
  grunt.registerTask("test", "ensure everything's installed and run tests",
      [
        "install",                         // install
        "validate"
      ]);
  grunt.registerTask("default", "run 'test' task by default", ["test"]);

  grunt.initConfig(configuration);
}

// Export the configuration
module.exports = configureGrunt;
