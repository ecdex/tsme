var output = {
  stdout: function () { (console.log).apply(console, arguments); },
  terminalFailure: function (shellStatus, message) {
    console.log(message);
    process.exit(shellStatus);
  }
};

module.exports = output;
