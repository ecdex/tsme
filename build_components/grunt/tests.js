function loadTestTasks() {
  return {
    express: {
      "test-server": {
        options: {
          script: "server.js",
          output: "Express server listening",
          logs: {
            out: "logs/ghost_test_server_stdout.log",
            err: "logs/ghost_test_server_stderr.log"
          }
        }
      },
      "test-middleware": {
        options: {
          script: "test/fixtures/middleware_test_server/index.js",
          output: "Test application is listening",
          logs: {
            out: "logs/ghost_test_middleware_stdout.log",
            err: "logs/ghost_test_middleware_stderr.log"
          }
        }
      }
    }
  };
}

module.exports = loadTestTasks;
