/*globals describe, it, beforeEach, afterEach, rewireInApp */
/*jshint expr:true*/

require("should");
var sinon = require("sinon"),
    environmental = require("environmental"),
    _ = require("lodash"),
    helpers = require("./test_helpers"),

    server = rewireInApp("server");


describe("top-level server", function () {
  var config,
      sandbox,
      expressStubContainer = {};

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    config = server.__get__("config");
  });

  afterEach(function () {
    sandbox.restore();
    server.__set__("config", environmental.config());
  });



  describe("module", function () {
    it("includes a 'launch' function", function () {
      server.launch.should.be.a.Function;
    });

    it("includes a 'middleware' function", function () {
      server.middleware.should.be.a.Function;
    });
  });

  describe("setup helpers", function () {
    describe("setContentBasePath", function () {
      var setContentBasePath,
          terminalFailureStub;

      beforeEach(function () {
        setContentBasePath = server.__get__("setContentBasePath");
        var output = server.__get__("output");
        terminalFailureStub = sandbox.stub(output, "terminalFailure");
      });

      it("copies the path from the configuration", function () {
        config.content.basepath = "./content";
        setContentBasePath();
        server.__get__("contentBasePath").should.equal("./content");
        terminalFailureStub.called.should.be.false;
      });

      it("fails if the configured base path doesn't exist", function () {
        config.content.basepath = "./other_content";
        setContentBasePath();
        terminalFailureStub.called.should.be.true;
        terminalFailureStub.args[0][0].should.be.greaterThan(0);
        terminalFailureStub.args[0][1].should.startWith(
            "Cannot find your content directory, './other_content'"
        );
      });

      it("fails if the configured base path doesn't contain a 'pages' directory", function () {
        config.content.basepath = "./test/fixtures/directory_configs/content_no_pages";
        setContentBasePath();
        terminalFailureStub.called.should.be.true;
        terminalFailureStub.args[0][0].should.be.greaterThan(0);
        terminalFailureStub.args[0][1].should.startWith(
            "Cannot find your directory for page Markdown, 'test/fixtures/directory_configs/content_no_pages/pages'"
        );
      });

      it("fails if the configured base path doesn't contain a 'templates' directory", function () {
        config.content.basepath = "./test/fixtures/directory_configs/content_no_templates";
        setContentBasePath();
        terminalFailureStub.called.should.be.true;
        terminalFailureStub.args[0][0].should.be.greaterThan(0);
        terminalFailureStub.args[0][1].should.startWith(
            "Cannot find your directory for Handlebars templates, 'test/fixtures/directory_configs/content_no_templates/templates'"
        );
      });
    });
  });

  describe("initialized server", function () {
    var stdoutStub;

    beforeEach(function () {
      server.__set__("express", helpers.mockExpressFactory(expressStubContainer));
      var outputHelper = server.__get__("output");
      sandbox.stub(outputHelper, "terminalFailure");  // don't care
      stdoutStub = sandbox.stub(outputHelper, "stdout");
    });

    function commonBehaviors(factory) {
      it("calls use() to map the static assets path", function () {
        factory();
        var appStub = expressStubContainer.appStub,
            useAssetsCalls = _.select(appStub.use.args, function (callArgs) {
              return callArgs[0] === "/assets";
            });

        useAssetsCalls.length.should.equal(1);
        useAssetsCalls[0].length.should.equal(2);

        // second argument to .use would normally be an Express server function,
        // but thanks to mockExpressFactory, it will be a hash of test info
        useAssetsCalls[0][1].spyFunctionName.should.equal("static");
        useAssetsCalls[0][1].arguments[0].should.equal("public/assets");
        useAssetsCalls[0][1].arguments[1].should.eql({ maxAge: 31536000000 });
      });

      it("calls use() to connect a root server instance", function () {
        factory();
        var appStub = expressStubContainer.appStub,
            rootUseCalls = _.select(appStub.use.args, function (callArgs) {
              return typeof callArgs[0] === "function";
            });

        rootUseCalls.length.should.equal(1);
        rootUseCalls[0].length.should.equal(1);
        helpers.shouldBeAnInstanceOfExpress(rootUseCalls[0][0]);
      });

      it("sets up for processing Handlebars", function () {
        factory();
        var appStub = expressStubContainer.appStub,
            setStub = appStub.set;
        setStub.calledTwice.should.be.true;

        var viewsIndex = (setStub.args[0][0] === "views") ? 0 : 1;
        setStub.args[viewsIndex][1].should.equal("content/templates");

        var viewsEngineIndex = (setStub.args[0][0] === "views") ? 1 : 0;
        setStub.args[viewsEngineIndex][0].should.equal("view engine");
        setStub.args[viewsEngineIndex][1].should.equal("hbs");

        var engineStub = appStub.engine;
        engineStub.calledOnce.should.be.true;
        engineStub.args[0][0].should.equal("hbs");
        engineStub.args[0][1].should.be.a.Function;
      });

      it("installs our Handlebars helpers", function () {
        var installStub = sandbox.stub(server.__get__("helpers"), "registerHelpers");
        factory();
        installStub.calledOnce.should.be.true;
      });
    }

    describe("middleware", function () {
      it("returns an Express instance", function () {
        var app = server.middleware();
        expressStubContainer.expressStub.calledOnce.should.be.true;
        expressStubContainer.appStub.should.equal(app);
      });

      it("accepts an optional config hash", function () {
        var nonDefaultPath = "base/path/over/here";
        server.middleware({
          server: { port: 42 },
          content: {
            basepath: nonDefaultPath,
            encoding: "utf8"
          }
        });
        server.__get__("contentBasePath").should.equal(nonDefaultPath);
      });

      commonBehaviors(server.middleware);
    });

    describe("stand-alone", function () {
      it("instantiates an Express instance", function () {
        server.launch();
        expressStubContainer.expressStub.calledOnce.should.be.true;
      });

      it("has the 'app' listen() on port 3000 by default", function () {
        server.launch();
        var appStub = expressStubContainer.appStub;
        appStub.listen.calledOnce.should.be.true;
        var args = expressStubContainer.appStub.listen.getCall(0).args;
        args.length.should.equal(1);
        args[0].should.equal(3000);
      });

      it("listen()'s on the port from the configuration", function () {
        config.server.port = "3333";
        server.launch();

        var appStub = expressStubContainer.appStub;
        appStub.listen.calledOnce.should.be.true;
        var args = expressStubContainer.appStub.listen.getCall(0).args;
        args.length.should.equal(1);
        args[0].should.equal(3333);
      });

      it("logs a start-time message including the port number", function () {
        config.server.port = "4242";
        server.launch();

        stdoutStub.calledOnce.should.be.true;
        var args = stdoutStub.getCall(0).args;
        args.length.should.equal(1);
        args[0].should.equal("Express server listening on port 4242");
      });

      commonBehaviors(server.launch);
    });
  });
});
