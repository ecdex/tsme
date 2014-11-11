var hbs = require("express-hbs"),
    _ = require("lodash");


console.log("handlebars_helpers/index loading");
function inProductionLikeEnvironment() {
  return process.env.NODE_ENV !== "development" &&
      process.env.NODE_ENV !== "test";
}


var helpers;
helpers = {
  install_resource_loading_errorcheck_functions: function () {
    if (inProductionLikeEnvironment()) {
      return "";
    }

    return new hbs.SafeString([
      "<script type=\"text/javascript\">",
      "  resourcesWeShouldHaveLoaded = {};",

      "  function loadingCss(nickname) {",
      "    resourcesWeShouldHaveLoaded[nickname] = false;",
      "    var el = document.getElementById(nickname + '-load');",
      "    el.onload = function () { resourcesWeShouldHaveLoaded[nickname] = 'loaded'; };",
      "  }",

      "  function loadingJs(nickname, url) {",
      "    resourcesWeShouldHaveLoaded[nickname] = false;",
      "    var el = document.getElementById(nickname + '-load');",
      "    el.onload = function () { resourcesWeShouldHaveLoaded[nickname] = 'loaded'; };",
      "    el.src = url;",
      "  }",
      "</script>"
    ].join(""));
  },

  load_css: function (nickname, options) {
    if (inProductionLikeEnvironment()) {
      return new hbs.SafeString("<link rel=\"stylesheet\" href=\"" + options.hash.production_path + "\">");
    } else {
      return new hbs.SafeString([
        "<link rel=\"stylesheet\" id=\"" + nickname + "-load\" href=\"" + options.hash.development_path + "\">",
        "<script type=\"text/javascript\">loadingCss('" + nickname + "');</script>"
      ].join(""));
    }
  },

  load_js: function (nickname, options) {
    if (inProductionLikeEnvironment()) {
      return new hbs.SafeString("<script src=\"" + options.hash.production_path + "\"></script>");
    } else {
      return new hbs.SafeString([
        "<script id=\"" + nickname + "-load\"></script>",
        "<script type=\"text/javascript\">loadingJs('" + nickname + "', '" + options.hash.development_path + "');</script>"
      ].join(""));
    }
  },

  perform_resource_loading_errorcheck: function () {
    if (inProductionLikeEnvironment()) {
      return "";
    }

    return new hbs.SafeString([
      "<script type=\"text/javascript\">",
      "  window.onload = function () {",
      "    for (var key in resourcesWeShouldHaveLoaded) {",
      "      if (resourcesWeShouldHaveLoaded.hasOwnProperty(key) &&",
      "          resourcesWeShouldHaveLoaded[key] !== 'loaded') {",
      "        console.log(\"Error: didn't load asset nicknamed '\" + key + \"' by completion of page load.  Something is probably wrong.\");",
      "      }",
      "    }",
      "  };",
      "</script>"
    ].join(""));
  },

  add_css_link: function (nickname, stylesheetPath) {
    var jsToAddLinkToHead = [
      "var el = document.createElement('link');",
      "el.type = 'text/css';",
      "el.rel = 'stylesheet';",
      "el.id = '" + nickname + "-load';",
      "el.href = '" + stylesheetPath + "';",
      "document.getElementsByTagName('head')[0].appendChild(el);"
    ].join("");

    if (inProductionLikeEnvironment()) {
      return new hbs.SafeString([
        "<script type=\"text/javascript\">",
        jsToAddLinkToHead,
        "</script>"
      ].join(""));
    } else {
      return new hbs.SafeString([
        "<script type=\"text/javascript\">",
        jsToAddLinkToHead,
        "loadingCss('" + nickname + "');",
        "</script>"
      ].join(""));
    }
  },

  registerHelpers: function () {
    var keys = _.difference(_.keys(helpers), ["registerHelpers"]);
    _.each(keys, function (key) {
      hbs.registerHelper(key, helpers[key]);
    });
  }
};

module.exports = helpers;
