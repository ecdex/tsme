
// hash structure:  top-level key matches the Sauce Labs broswerName which
//  matches the name of selenium-webdriver NPM functions
//  webdriver.Capabilities.___().  Each key's value is an array of configurations
//  to be run by merging into the base selection for the key.  First entry
//  in each array is the default configuration when just the browser type
//  is selected.  Each configuration in the array is a hash whose keys
//  match available Sauce Labs platforms, see https://saucelabs.com/platforms

module.exports = {
  android: [],
  chrome: [
    { platform: "OS X 10.9", version: "" }
  ],
  firefox: [],
  ie: [],
  ipad: [],
  iphone: [],
  opera: [],
  safari: []
};
