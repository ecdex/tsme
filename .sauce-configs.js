
// hash structure:  top-level key matches the Sauce Labs broswerName which
//  matches the name of selenium-webdriver NPM functions
//  webdriver.Capabilities.___().  Each key's value is an array of configurations
//  to be run by merging into the base selection for the key.  First entry
//  in each array is the default configuration when just the browser type
//  is selected.  Each configuration in the array is a hash whose keys
//  match available Sauce Labs platforms, see https://saucelabs.com/platforms

module.exports = {
  chrome: [
    //{ platform: "OS X 10.10", version: "37" },
    //{ platform: "OS X 10.9", version: "" },
    //{ platform: "OS X 10.8", version: "27" },
    { platform: "Windows 8.1", version: "35" },
    { platform: "Linux", version: "35" }
  ],
  firefox: [
    { platform: "OS X 10.10", version: "33" },
    { platform: "Windows 8.1", version: "33" },
    { platform: "Linux", version: "33" }
  ],
  safari: [
    { platform: "OS X 10.10", version: "8" }
  ],
  ie: [
    { platform: "Windows 8.1", version: "11" },
    { platform: "Windows 8", version: "10" },
    { platform: "Windows 7", version: "9" },
    { platform: "Windows 7", version: "8" }
  ],
  iPad: [
    { platform: "OS X 10.9", version: "8.0", deviceOrientation: "portrait" }
  ],
  iPhone: [
    { platform: "OS X 10.9", version: "8.1", deviceOrientation: "portrait" }
  ],
  opera: [
    { platform: "Windows 7", version: "12" }
  ],
  android: [
    { platform: "Linux", version: "4.3", deviceOrientation: "portrait",
      deviceName: "Google Nexus 7C Emulator" }
  ]
};
