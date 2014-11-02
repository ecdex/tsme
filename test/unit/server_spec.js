/*globals describe, it, beforeEach, rewireInApp, mockExpressFactory */
/*jshint expr:true*/

var should = require("should"),
    server = rewireInApp("server");

should.equal(true, true);      // To stop jshint complaining


describe("top-level server", function () {
  describe("module", function () {
    it("includes a 'launch' function", function () {
      server.launch.should.be.a.Function;
    });
  });

  describe("launching a stand-alone server", function () {
    describe("'launch' function", function () {
      var expressStubContainer = {};
      beforeEach(function () {
        server.__set__("express", mockExpressFactory(expressStubContainer));
      });

      it("instantiates an Express instance", function () {
        server.launch();
        expressStubContainer.expressStub.calledOnce.should.be.true;
      });
    });
  });
});
