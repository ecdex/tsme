
function loadInstallTasks(grunt) {
  grunt.registerTask("install",
      "copy stuff between files checked into source control and where they need to be to run tests",
      [
        "shell:bower",
        "get-default-environment-configs",
        "npm-install-test-server",
        "refresh-test-servers-copy-of-tsme",
        "copy:assets"
      ]);

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


  return {
    copy: {
      assets: {
        files: [
          {
            src: "bower_components/bootstrap/dist/css/bootstrap.min.css",
            dest: "public/assets/css/bootstrap.min.css"
          },
          {
            src: "bower_components/bootstrap/dist/css/bootstrap-theme.min.css",
            dest: "public/assets/css/bootstrap-theme.min.css"
          },
          {
            src: "bower_components/bootstrap/dist/js/bootstrap.min.js",
            dest: "public/assets/js/bootstrap.min.js"
          },
          {
            src: "bower_components/jquery/dist/jquery.min.js",
            dest: "public/assets/js/jquery.min.js"
          },
          {
            src: "bower_components/jquery/dist/jquery.min.map",
            dest: "public/assets/js/jquery.min.map"
          },
          {
            expand: true,
            cwd: "content/assets",
            src: "**",
            dest: "public/assets"
          }
        ]
      }
    },

    shell: {
      envs: {
        command: "mkdir -p envs && cp -a test/fixtures/build_envs/* envs/"
      },

      bootstrap: {
        command:
            "mkdir -p public/assets/css && " +
            "cp -a bower_components/dist/css/bootstrap.min.css public/assets/css && " +
            "mkdir -p public/assets/js && " +
            "cp -a bower_components/disk/js/bootstrap.min.js public/assets/js"
      },

      "install-test-server": {
        command: "npm install",
        options: {
          execOptions: {
            cwd: "test/fixtures/middleware_test_server"
          }
        }
      },

      "rsync-tsme-to-fixtures": {
        command: "rsync -qa --del package.json middleware.js app test/fixtures/middleware_test_server/node_modules/tsme"
      },

      bower: {
        command: "node_modules/.bin/bower --allow-root install",
        options: {
          stdout: true,
          stdin: false
        }
      }
    }
  };
}

module.exports = loadInstallTasks;
