/*globals describe, it, rewireInApp */
/*jshint expr:true*/

require("should");
var helpers = rewireInApp("handlebars_helpers"),
    fromMarkdownFile = helpers.fromMarkdownFile;

describe("custom Handlebars helpers", function () {
  var helperOptions = { data: { root: {
    markdownEncoding: "utf8",
    contentPath: "content/pages"
  } } };

  describe("fromMarkdownFile()", function () {
    it("loads and renders a markdown file", function () {
      var safeString = fromMarkdownFile("about", helperOptions);
      safeString.string.should.equal("<p>About.  So very many things.</p>\n");
    });
  });

  it("returns an empty string for a file that can't be read", function () {
    var safeString = fromMarkdownFile("no-such-file", helperOptions);
    safeString.string.should.equal("");
  });
});
