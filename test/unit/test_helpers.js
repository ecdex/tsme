/*jshint expr:true*/

require("should");
var sinon = require("sinon"),

    helpers = {
      shouldBeAnInstanceOfExpress: function (express) {
        // first-order duck typing for an express server
        express.should.be.a.Function;
        express.length.should.equal(3, "a real express server function has an arity of 3");
      },

      mockExpressFactory: function (expressStubContainer) {
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

        var static = function () {
          return {
            spyFunctionName: "static",
            arguments: arguments
          };
        };
        factory.static = sinon.spy(static);

        return factory;
      }
    };

module.exports = helpers;
