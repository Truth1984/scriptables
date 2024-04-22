// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: sitemap;

if (typeof require == "undefined") require = importModule;
const u = require("./awadau");
const un = require("./universe");
console.log = u.consoleLog;

let result = un.paramEval();
// config={}, use un.confSet({},true) to set value
Promise.resolve(result).then((result) => un.shortcutComplete(result ? result : ""));
