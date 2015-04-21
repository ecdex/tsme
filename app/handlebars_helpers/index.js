var path = require("path"),
    fs = require("fs"),
    hbs = require("express-hbs"),
    _ = require("lodash"),
    marked = require("marked"),
    helpers;


helpers = {
  fromMarkdownFile: function (fileName, options) {
    var markdownContent = "",
        markdownEncoding = options.data.root.markdownEncoding,
        contentPath = options.data.root.contentPath,
        newPath, fullPath;

    do {
      fullPath = path.join(contentPath, fileName+".md");

      try {
        markdownContent = fs.readFileSync(fullPath, { encoding: markdownEncoding });
      } catch (e) {
        newPath = contentPath.replace(/\/[^\/]*$/, "");
        contentPath = (newPath === contentPath) ? "" : newPath;
      }
    } while (markdownContent === "" && contentPath !== "");

    return new hbs.SafeString(marked(markdownContent));
  },

  registerHelpers: function () {
    var keys = _.difference(_.keys(helpers), ["registerHelpers"]);
    _.each(keys, function (key) {
      hbs.registerHelper(key, helpers[key]);
    });
  }
};

module.exports = helpers;
