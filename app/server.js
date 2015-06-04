var express = require("express"),
    fs = require("fs"),
    path = require("path"),
    hbs = require("express-hbs"),
    config = require("environmental").config(),

    output = require("./output_helper"),
    helpers = require("./handlebars_helpers"),
    testHelpers = require("quick-grunt-config-mocha-sauce/lib/helpers"),

    contentBasePath;

function setContentBasePath() {
  contentBasePath = config.content.basepath;

  function directoryExistsOrDie(path, message) {
    if (!fs.existsSync(path)) {
      output.terminalFailure(1, message);
    }
  }

  directoryExistsOrDie(contentBasePath,
      "Cannot find your content directory, '" + contentBasePath + "',\n" +
      " as specified by config.content.basepath from the environment."
  );

  var pagesPath = path.join(contentBasePath, "pages");
  directoryExistsOrDie(pagesPath,
      "Cannot find your directory for page Markdown, '" + pagesPath + "',\n" +
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
  testHelpers(hbs);
}


function setup() {
  setContentBasePath();

  var app = express();
  configureAppForHandlebars(app);
  helpers.registerHelpers();

  var oneYear = 31536000000;
  app.use("/assets", express["static"]("public/assets", { maxAge: oneYear }));
  app.use("/", express["static"]("public/", { maxAge: oneYear }));
  app.use(require("./request_handler")(config, contentBasePath));
  return app;
}

function serverFactory() {
  var port = parseInt(config.server.port) || 3000;
  setup().listen(port);
  output.stdout("Express server listening on port " + port);
}

function middlewareFactory(hostAppConfig) {
  config = hostAppConfig || config;
  return setup();
}

module.exports = {
  launch: serverFactory,
  middleware: middlewareFactory
};
