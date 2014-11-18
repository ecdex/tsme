var _ = require("lodash");

function loadCodingStandardsTasks() {
  var lintableFiles = {
    app: {
      files: {
        src: [
          "*.js",
          "app/**/*.js"
        ]
      }
    },
    build_components: {
      files: {
        src: [
          "build_components/**/*.js"
        ]
      }
    },
    test: {
      files: {
        src: [
          "test/*.js",
          "test/unit/**/*.js",
          "test/integration/**/*.js",
          "test/fixtures/middleware_test_server/*.js"
        ]
      }
    }
  };

  return {
    jshint: _.merge({
      options: {
        jshintrc: ".jshintrc"
      }
    }, lintableFiles),

    jscs: _.merge({
      app: { options: {} },
      build_components: { options: {} },
      test: { options: {} }
    }, lintableFiles)
  };
}

module.exports = loadCodingStandardsTasks;
