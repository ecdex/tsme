require("string.prototype.endswith");

var express = require("express"),
    fs = require("fs"),
    path = require("path"),
    hbs = require("express-hbs"),
    marked = require("marked"),
//    sass = require("node-sass"),
    config = require("environmental").config(),
    output = require("./output_helper"),
    markdownEncoding,
    contentBasePath;

function pagesPath() {
  return path.join(contentBasePath, "pages");
}

function templateForPage() {  // eventual signature is markdownPath in
  return "default";
}

function server(req, res, next) {
  var markdownPath = req.path.replace(/\.[^.]+$/, ""),
      absolutePath = path.join(pagesPath(), markdownPath+".md");

  if (absolutePath.endsWith("/.md")) {
    absolutePath = absolutePath.replace("/.md", "/index.md");
  }

  var markdownContent;
  try {
    markdownContent = fs.readFileSync(absolutePath, { encoding: markdownEncoding });
  } catch (e) {
    next();
    return;
  }

  var htmlContent = marked(markdownContent);
  res.render(templateForPage(markdownPath), {
    contentFromMarkdown: htmlContent
  });
}

function directoryExistsOrDie(path, message) {
  if (!fs.existsSync(path)) {
    output.terminalFailure(1, message);
  }
}

function setContentBasePath() {
  contentBasePath = config.content.basepath;

  directoryExistsOrDie(contentBasePath,
      "Cannot find your content directory, '" + contentBasePath + "',\n" +
      " as specified by config.content.basepath from the environment."
  );
  directoryExistsOrDie(pagesPath(),
      "Cannot find your directory for page Markdown, '" + pagesPath() + "',\n" +
      " 'pages' under the directory from config.content.basepath."
  );

  var templatesPath = path.join(contentBasePath, "templates");
  directoryExistsOrDie(templatesPath,
      "Cannot find your directory for Handlebars templates, '" + templatesPath + "',\n" +
      " 'pages' under the directory from config.content.basepath."
  );
}

function configureAppForHandlebars(app) {
  app.set("view engine", "hbs");
  app.set("views", path.join(contentBasePath, "templates"));
  app.engine("hbs", hbs.express3({
    partialsDir: path.join(contentBasePath, "templates/partials"),
    layoutsDir: path.join(contentBasePath, "templates/layouts")
  }));
}

//function configureAppForSass(app) {
//  app.use(sass.middleware({
//    debug: true,
//    src: path.join(contentBasePath, "sass"),
//    dest: path.join(contentBasePath, "assets/css"),
//    prefix: "/css",
//    outputStyle: "compressed"
//  }));
//  app.use(express.static(path.join(contentBasePath, "assets")));
//}


function serverFactory() {
  markdownEncoding = config.content.encoding || "utf8";
  setContentBasePath();

  var app = express();
  configureAppForHandlebars(app);
//  configureAppForSass(app);

  app.use(server);

  var port = parseInt(config.server.port) || 3000;
  app.listen(port);
  output.stdout("Express server listening on port " + port);
}

module.exports = {
  launch: serverFactory
};
