/*globals describe, it, beforeEach, afterEach, rewireInApp, buildFailureOnCall */
/*jshint expr:true*/

require("should");
var sinon = require("sinon"),

    makeHandler = rewireInApp("request_handler"),
    requestHandler = makeHandler("utf8", "content");



// note:  this block runs in only one mode (stand-alone server or middleware)
// to ensure TSME actually behaves the same in both configurations, we
// rely on (1) integration tests and (2) randomly choosing which mode
// is used.  If failures occur, note the log line generated by the test
// run to see what mode it was in, and manually assign that value to the
// mode variable here to ensure that you're debugging in the right case.
describe("request handling", function () {
  var sandbox, req, res;

  function requestAndValidate(done) {
    requestHandler(req, res,
        buildFailureOnCall(done, "Express request handler should have responded but didn't"));
  }

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    req = {
      path: "/",
      params: {},
      route: {}
    };
    res = {
      locals: {},
      render: function () {},
      redirect: function () {}
    };
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("for root it serves content/pages/index.md", function () {
    it("processes through markdown", function (done) {
      res.render = function (templateName, contentHash) {
        contentHash.contentFromMarkdown.should.equal(
            "<p><strong>Hello</strong>, <em>world</em>.</p>\n"
        );
        done();
      };

      requestAndValidate(done);
    });

    it("uses content/templates/default.hbs when content/templates/index.hbs doesn't exist", function (done) {
      var handlerFs = makeHandler.__get__("fs");
      sandbox.stub(handlerFs, "existsSync").returns(false);

      res.render = function (templateName) {
        templateName.should.equal("default");
        done();
      };

      requestAndValidate(done);
    });

    it("uses content/templates/index.hbs when that exists", function (done) {
      res.render = function (templateName) {
        templateName.should.equal("index");
        done();
      };

      requestAndValidate(done);
    });
  });

  describe("for any page", function () {
    describe("a page in the root directory", function () {
      beforeEach(function () {
        req.path = "/some-page";
      });

      it("gets the default template", function (done) {
        res.render = function (templateName) {
          templateName.should.equal("default");
          done();
        };

        requestAndValidate(done);
      });

      it("includes content from the page's markdown file", function (done) {
        res.render = function (templateName, contentHash) {
          contentHash.contentFromMarkdown.should.equal(
              "<p>This page.  Is a page.</p>\n"
          );
          done();
        };

        requestAndValidate(done);
      });
    });
  });

  describe("finds index.md", function () {
    function assertFileFoundForPath(path, expectedMdFilePath, done) {
      req.path = path;
      sandbox.stub(res, "render");
      var templateStub = sandbox.stub(requestHandler, "templateForPage");

      requestAndValidate(done);

      templateStub.calledOnce.should.equal(true);
      templateStub.firstCall.args.should.eql([expectedMdFilePath]);
      done();
    }

    it("when the path ends in a slash", function (done) {
      assertFileFoundForPath("/a_directory/", "/a_directory/index", done);
    });

    it("when the path could be a page name (doesn't end in a slash)", function (done) {
      assertFileFoundForPath("/a_directory", "/a_directory/index", done);
    });
  });

  describe("template finding for a page in a subdirectory", function () {
    function assertTemplateForPath(path, expectedTemplate, done) {
      req.path = path;
      res.render = function (templateName) {
        templateName.should.equal(expectedTemplate);
        done();
      };

      requestAndValidate(done);
    }

    it("finds the root default for a page in the root", function (done) {
      assertTemplateForPath("/some-page", "default", done);
    });

    it("finds a default in a directory below root for a page in that directory", function (done) {
      assertTemplateForPath("/a_directory/a_page", "a_directory/default", done);
    });

    it("finds a default in a directory below root for a page in a subdirectory without its own default", function (done) {
      assertTemplateForPath("/a_directory/one_subdirectory/x_page", "a_directory/default", done);
    });

    it("finds the root default for a page in a directory below root that doesn't contain a default", function (done) {
      assertTemplateForPath("/b_directory/b_page", "default", done);
    });

    it("finds the root default for a page in a path below root that doesn't contain any defaults", function (done) {
      assertTemplateForPath("/b_directory/one_subdirectory/one_page", "default", done);
    });

    it("finds a default in a subdirectory for a page in that directory", function (done) {
      assertTemplateForPath(
          "/b_directory/other_subdirectory/other_page",
          "b_directory/other_subdirectory/default",
          done);
    });

    it("finds a default in a subdirectory for a page that is in a matching sub-subdirectory", function (done) {
      assertTemplateForPath(
          "/b_directory/other_subdirectory/sub_sub_directory/page",
          "b_directory/other_subdirectory/default",
          done);
    });
  });

  describe("redirects", function () {
    it("from 'blah/blah/index' to 'blah/blah/'", function (done) {
      req.path = "/a_directory/index";
      var redirectStub = sandbox.stub(res, "redirect");

      requestAndValidate(done);

      redirectStub.calledOnce.should.equal(true);
      redirectStub.firstCall.args.should.eql(["/a_directory/"]);
      done();
    });
  });
});
