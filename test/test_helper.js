/*global rewireInApp: true */
/*global mockExpressFactory: true */

var path = require("path"),
    rewire = require("rewire"),
    sinon = require("sinon");

rewireInApp = function (appRelativePath) {
  return rewire(path.join(__dirname, "..", "app", appRelativePath));
};

mockExpressFactory = function (expressStubContainer) {
  var factory = sinon.stub();
  factory.returns({
    listen: sinon.stub(),
    use: sinon.stub(),
    set: sinon.stub(),
    engine: sinon.stub(),
    static: sinon.stub()
  });
  expressStubContainer.expressStub = factory;
  factory.static = sinon.stub();
  return factory;
};
