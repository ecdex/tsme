var path = require("path"),
    rewire = require("rewire"),
    sinon = require("sinon");

/*global rewireInApp: true */
rewireInApp = function (appRelativePath) {
  return rewire(path.join(__dirname, "..", "..", "app", appRelativePath));
};

/*global mockExpressFactory: true */
mockExpressFactory = function (expressStubContainer) {
  var factory = function () {
    var appStub = {
      listen: sinon.stub(),
      use: sinon.stub(),
      set: sinon.stub(),
      engine: sinon.stub(),
      static: sinon.stub()
    };
    expressStubContainer.appStub = appStub;
    return appStub;
  };

  factory = sinon.spy(factory);
  expressStubContainer.expressStub = factory;
  factory.static = sinon.stub();

  return factory;
};

/*global buildFailureOnCall: true */
buildFailureOnCall = function (done, msg) {
  return function () {
    done(new Error(msg));
  };
};
