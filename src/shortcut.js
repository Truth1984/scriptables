// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: sitemap;

if (typeof require == "undefined") require = importModule;
const u = require("./awadau");
const un = require("./universe");

let result = un.paramEval();
Promise.resolve(result).then((result) => un.shortcutComplete(result ? result : ""));
