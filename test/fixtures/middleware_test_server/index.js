// setup environment variables that configure tsme
process.env.NODE_APP_PREFIX = "TSME";
process.env.TSME_CONTENT_BASEPATH = "content";


var express = require("express"),
    tsme = require("tsme/middleware");

function serveHomePage(req, res) {
  res.send(
      "<h1>Index Page</h1><p>Example web app home page served by top-level Express server instance.</p><ul>" +
      "<li><a href=\"/subsite\">Go to encapsulated subbsite (middleware) home page</a></li>" +
      "<li><a href=\"/not-a-page\">See a 404 page from the parent web app</a></li>" +
      "<li><a href=\"/subsite/not-an-available-page\">See middleware handle a 404</a></li>" +
      "</ul>"
  );
}

var app = express();
app.get("/", serveHomePage);
app.use("/subsite", tsme());
app.use(function (req, res) {
  res.status(404).send("Sorry, can't find that.");
});

var portNumber = 3000;
app.listen(portNumber);
console.log("Test application is listening on port " + portNumber);
console.log("Ctrl+C to shut down");
