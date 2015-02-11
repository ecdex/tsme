function loadTestTasks() {
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
    }
  };
}

module.exports = loadTestTasks;
