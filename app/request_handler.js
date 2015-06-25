require("string.prototype.endswith");

var fs = require("fs"),
    path = require("path"),
    _ = require("lodash"),
    marked = require("marked"),

    config,
    contentBasePath;

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

function makeServer(tsmeConfig, contentBasePathIncoming) {
  config = tsmeConfig;
  contentBasePath = contentBasePathIncoming;

  var markdownEncoding = config.content.encoding || "utf8",
      server;
  server = function (req, res, next) {
    if (req.path.endsWith("/index")) {
      res.redirect(req.path.replace(/\/index$/, "/"));
      return;
    }

    var markdownPath = req.path.replace(/\.[^.]+$/, "");
    if (markdownPath.endsWith("/")) {
      markdownPath += "index";
    }

    var fullPath = path.join(path.join(contentBasePath, "pages"), markdownPath+".md"),
        markdownContent;
    try {
      markdownContent = fs.readFileSync(fullPath, { encoding: markdownEncoding });
    } catch (e) {
      markdownPath += "/index";
      fullPath = path.join(path.join(contentBasePath, "pages"), markdownPath+".md");
      try {
        markdownContent = fs.readFileSync(fullPath, { encoding: markdownEncoding });
      } catch (e) {
        next();
        return;
      }
    }

    var context = {
      contentFromMarkdown: marked(markdownContent),
      contentPath: fullPath.replace(/\/[^\/]+\.md$/, ""),
      markdownEncoding: markdownEncoding
    };
    if (req.flash) {
      var flashes = req.flash();
      if (flashes.error) {
        context.flashError = flashes.error;
      }
    }
    if (config.commonContext) {
      _.assign(context, config.commonContext(req));
    }
    res.render(
        server.templateForPage(markdownPath),
        context
    );
  };

  server.templateForPage = templateForPage;
  return server;
}

module.exports = makeServer;
