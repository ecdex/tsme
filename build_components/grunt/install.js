
function loadInstallTasks(grunt) {
  grunt.registerTask("get-default-environment-configs",
      "environment config info (read by the environmental NPM) needs to be in /envs to run, but canonical examples are kept in /test/fixtures/build_envs",
      ["shell:envs"]
  );

  grunt.registerTask("npm-install-test-server",
      "the Express server used to test tsme as middleware is organized as a separate node package, so install its dependencies",
      ["shell:install-test-server"]
  );
  grunt.registerTask("refresh-test-servers-copy-of-tsme",
      "during development, tsme source files may be modified, so make sure copies used for middleware config are updated",
      "shell:rsync-tsme-to-fixtures"
  );

  grunt.registerTask("install",
      "copy stuff between files checked into source control and where they need to be to run tests",
      ["get-default-environment-configs", "npm-install-test-server", "refresh-test-servers-copy-of-tsme"]);

  return {
    shell: {
      envs: {
        command: "mkdir -p envs && cp -a test/fixtures/build_envs/* envs/"
      },
      "install-test-server": {
        command: "npm install --silent",
        options: {
          execOptions: {
            cwd: "test/fixtures/middleware_test_server"
          }
        }
      },
      "rsync-tsme-to-fixtures": {
        command: "rsync -qa --del package.json middleware.js app test/fixtures/middleware_test_server/node_modules/tsme"
      }
    }
  };
}

module.exports = loadInstallTasks;
