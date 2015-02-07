var _ = require("lodash"),
    Glob = require("glob").Glob,
    path = require("path");

module.exports = function (grunt, extraTopLevelDirectories) {
  extraTopLevelDirectories = extraTopLevelDirectories || [];
  var excludedDirectoryNameSubstrings = ["node_modules", "bower_components"],
      implicitTopLevelDirectories = ["app", "lib", "test"],
      topLevelDirectories = _.uniq(implicitTopLevelDirectories.concat(extraTopLevelDirectories)),
      lintableFiles = {};

  // itemize each directory so we can exclude known external dependency caches
  _.each(topLevelDirectories, function (topLevelDir) {
    var hash = {},
        glob = new Glob(path.join(topLevelDir, "**"), { sync: true }),
        directories = _.compact(_.map(glob.cache, function (value, key) { return (typeof value === "object") ? key : null; }));
    directories = _.reject(directories, function (directory) {
      return _.any(excludedDirectoryNameSubstrings, function (substring) {
        // use a loose match so we get things like 'old_node_modules' and 'bower_components.bak'
        return directory.indexOf(substring) > -1;
      });
    });

    hash[topLevelDir] = {
      files: {
        src: _.map(directories, function (directoryName) {
          return path.join(directoryName, "*.js");
        })
      }
    };

    // arbitrarily include all the JS files from the root directory in the 'app' target
    if (topLevelDir === "app") {
      hash[topLevelDir].files.src.unshift("*.js");
    }

    _.assign(lintableFiles, hash);
  });

  return {
    jshint: _.assign({
      options: {
        jshintrc: ".jshintrc"
      }
    }, lintableFiles),

    jscs: _.transform(lintableFiles, function (result, hash, key) {
      result[key] = hash;
      result[key].options = {};
    })
  };
};
