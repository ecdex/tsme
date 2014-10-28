require("string.prototype.endswith");
var express = require("express"),
    fs = require("fs"),
    hbs = require("express-hbs"),
    marked = require("marked"),
    path = require("path"),
    sass = require("node-sass"),
    when = require("when"),

    envVar = "development",

    markdownEncoding = "utf8",
    app,
    configForEnvironment,
    contentBasePath;

function server(req, res, next) {
  var mdPath = req.url.replace(/\.[^.]+$/, ""),
      absolutePath = path.join(contentBasePath, "pages", mdPath+".md");

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
  res.render("index", {
    contentFromMarkdown: htmlContent
  });
}

function serverFactory(options) {
  var deferred = when.defer();

  app = options.app;

  readConfigurationForCurrentEnvironment(options, deferred);
  if (!configForEnvironment) {
    return deferred.promise;
  }

  getContentBasePath(deferred);
  if (!contentBasePath) {
    return deferred.promise;
  }

  configureAppForHandlebars(app);
  configureAppForSass(app);

  app.use(server);
  deferred.resolve(server);
  return deferred.promise;
}


function readConfigurationForCurrentEnvironment(options, deferred) {
  configFileName = options.config;
  try {
    wholeConfig = require(configFileName);
    configForEnvironment = wholeConfig[envVar];
  } catch (ignore) {
  }

  if (!configForEnvironment) {
    deferred.reject(
            "Cannot find your config file, '" + configFileName + "', or it has no section for '" +
            envVar + "'."
    );
  }
}

function getContentBasePath(deferred) {
  if (configForEnvironment.content) {
    markdownEncoding = configForEnvironment.content.encoding || markdownEncoding;
  }

  contentBasePath = configForEnvironment.paths.contentPath;
  if (!fs.existsSync(contentBasePath)) {
    deferred.reject(
            "Cannot find your content directory, '" + contentBasePath +
            "', as specified by config.paths.contentPath in '" + configFileName + "'."
    );
  }
  return contentBasePath;
}

function configureAppForHandlebars() {
  app.set("view engine", "hbs");
  app.set("views", path.join(contentBasePath, "templates"));
  app.engine("hbs", hbs.express3({
    partialsDir: path.join(contentBasePath, "templates/partials"),
    layoutsDir: path.join(contentBasePath, "templates/layouts")
  }));
}

function configureAppForSass() {
  app.use(sass.middleware({
    debug: true,
    src: path.join(contentBasePath, "sass"),
    dest: path.join(contentBasePath, "assets/css"),
    prefix: "/css",
    outputStyle: "compressed"
  }));
  app.use(express.static(path.join(contentBasePath, "assets")));
}


module.exports = serverFactory;
