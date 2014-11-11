var express = require("express"),
    fs = require("fs"),
    path = require("path"),
    hbs = require("express-hbs"),
//    sass = require("node-sass"),
    config = require("environmental").config(),

    output = require("./output_helper"),
    helpers = require("./handlebars_helpers"),

    markdownEncoding,
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


function setup() {
  markdownEncoding = config.content.encoding || "utf8";
  setContentBasePath();

  var app = express();
  configureAppForHandlebars(app);
//  configureAppForSass(app);
  helpers.registerHelpers();

  var oneYear = 31536000000;
  app.use("/assets", express["static"]("public/assets", { maxAge: oneYear }));
  app.use(require("./request_handler")(markdownEncoding, contentBasePath));
  return app;
}

function serverFactory() {
  var port = parseInt(config.server.port) || 3000;
  setup().listen(port);
  output.stdout("Express server listening on port " + port);
}

function middlewareFactory() {
  return setup();
}

module.exports = {
  launch: serverFactory,
  middleware: middlewareFactory
};
