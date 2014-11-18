tsme
====

Trivial Server for Markdown via Express

<!-- badge.fury.io version number badge here once published to NPM -->
[![Build Status](https://api.travis-ci.org/ecdex/tsme.png?branch=master)](https://travis-ci.org/ecdex/tsme "Check this project's build status on TravisCI")
[![Dependency Status](https://david-dm.org/ecdex/tsme.png?theme=shields.io)](https://david-dm.org/ecdex/tsme)
[![Development Dependency Status](https://david-dm.org/ecdex/tsme/dev-status.png?theme=shields.io)](https://david-dm.org/ecdex/tsme#info=devDependencies)

A simple Express application that serves static Markdown content
transformed to HTML through [marked](https://github.com/chjj/marked)
and [Handlebars](http://handlebarsjs.com/).  Intended to support
light production use, it can be run stand-alone but is expected
mostly to be used as middleware in a larger Express-based web
site/application.

TSME can be installed either directly from the
[GitHub repository](https://github.com/ecdex/tsme).  However you install,
there are several directories in the TSME repository intended as
examples of ways to structure the content that TSME serves, and not
actually expected to be used outside of TSME development and test:

* You'll want your own `content` directory (which can be named
whatever you want).  This will contain content for individual pages
in Markdown (in a directory hierarchy that matches the URL schem you
want for your site), Handlebars templates used to serve the HTML
generated from your Markdown, and any custom assets that must be
served along with your pages.
* There will have to be a `public` directory if you run TSME stand-alone
or in an Express configuration that doesn't serve static assets using
another component, then TSME will try to serve non-Markdown HTTP
requests by looking in the `public` directory.  The name and location
of this directory is not currently configurable (see our To-Do list
below).  But, in a production environment, static assets should be
served by a real web server or CDN prior to reaching TSME, anyway.
* You may want an `envs` directory.  TSME takes all of its configuration
from environment variables, and reads them via the [`environmental`
package](https://www.npmjs.org/package/environmental).  In addition to
the JavaScript for reading environment variables, environmental has
a recommended arrangement of shell scripts used to set those variables'
values.  TSME uses this convention, but you don't have to in order
to use TSME--any mechanism that sets information in the shell environment
that node uses when executing TSME will do.
* You may want a [`bower`](https://www.npmjs.org/package/bower) configuration.
TSME includes very minimal example content, but the example Handlebars
templates include Twitter [`bootstrap`](http://getbootstrap.com/) for
page styling.

## Installing from GitHub

TSME's dependencies and tool chain are intended to be familiar to
anyone who has built Express web applications in the past.

* Have `node`, `npm`, and `grunt` installed
* Clone TSME's git repository onto your local system
* In the repository, `npm install` to load dependencies
* `npm start` to start the example server locally
* navigating a browser to `http://localhost:3000/` will give you
the Markdown from `content/pages/index.md`

## Installing as an NPM

The TSME package can be installed simply by referencing it
from your `package.json`.

Note that as part of the install,
in addition to loading other NPM packages that TSME uses,
`npm install` will run `bower` to install the dependencies for TSME's
sample content, and configure the `envs` and `public`
directories to serve the sample content.  These steps are
unnecessary when you're using TSME in a production environment,
but hopefully the additional dependency downloads will not
cause you problems.

## Conventions

* TSME assumes that markdown file names have the extension `.md`
* TSME uses Handlebars to load files from your
`content/templates` directory, so naming there must conform to
its conventions.
* TSME relies on the directory structure under `content/pages`
matching the URL structure of (the portion of) your site served
by TSME.
* TSME assumes that if a Markdown file is supposed to be
served using a special Handlebars template, the template will
be located in a directory and have a name that matches the
markdown file's, but located under `content/templates`.  Markdown
files from `content/pages` that do not have matching Handlebars
templates are served using `content/templates/default.hbs`.

## To-Do

There are some configuration improvements that
are obvious, but not immediately necessary for the use of
TSME that is driving it's development.  Pull requests are
always welcome, but particularly for these:

* Make the location of the `public` directory configurable.
* Fetch `cover.css` from the bootstrap examples live on
installation rather than having it committed in TSME's
repository.
* Support an "installing in production" environment
variable that would cause `grunt install` (used by
`npm install`) to skip `bower` and copying things around within
TSME's directory structure.
* Include sample files in `envs` for production-like
configurations to demonstrate asset loading from CDNs.
* Make `app/handlebars_helpers/index.js#inProductionLikeEnvironment`
more configurable.

More significant planned development includes:

* Have a mechanism for setting a unique title for each page.
* Extract the JavaScript code used in TSME's sample page
templates for asset loading into a separate, reusable file
(without making it dependent on any external JS).
* Allow for there to be a `default.hbs` file in each directory
under `content/templates`, and look for those first when
a markdown file doesn't have an exactly-matching Handlebars
template.
* Have a wildcard-like mechanism allowing multiple markdown
files to be matched with the same non-default template.
