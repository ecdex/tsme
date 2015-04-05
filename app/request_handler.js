require("string.prototype.endswith");

var fs = require("fs"),
    path = require("path"),
    marked = require("marked");

function makeServer(markdownEncoding, contentBasePath) {
  function templateForPage(markdownPath) {
    var fullPath, defaultPath;
    markdownPath = markdownPath.replace(/^\//, "");

    do {
      fullPath = path.join(path.join(contentBasePath, "templates"), markdownPath + ".hbs");
      if (fs.existsSync(fullPath)) {
        return markdownPath;
      }

      defaultPath = path.join(contentBasePath, "templates", markdownPath, "default.hbs");
      if (fs.existsSync(defaultPath)) {
        return path.join(markdownPath, "default");
      }

      markdownPath = markdownPath.replace(/[^\/]+$/, "");
      markdownPath = markdownPath.replace(/\/$/, "");
    } while (markdownPath !== "");
    return "default";
  }

  return function (req, res, next) {
    var markdownPath = req.path.replace(/\.[^.]+$/, "");
    if (markdownPath.endsWith("/")) {
      markdownPath = markdownPath.replace(/\/$/, "/index");
    }

    var fullPath = path.join(path.join(contentBasePath, "pages"), markdownPath+".md"),
        markdownContent;
    try {
      markdownContent = fs.readFileSync(fullPath, { encoding: markdownEncoding });
    } catch (e) {
      next();
      return;
    }

    res.render(
        templateForPage(markdownPath),
        {
          contentFromMarkdown: marked(markdownContent),
          contentPath: fullPath.replace(/\/[^\/]+\.md$/, ""),
          markdownEncoding: markdownEncoding
        }
    );
  };
}

module.exports = makeServer;
