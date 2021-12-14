// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: magic;

if (typeof require == "undefined") require = importModule;
const u = require("./awadau");
const un = require("./universe");

let param = args.plainTexts;

if (param != undefined) {
  str = u.arrayToString(args.plainTexts, "");
  pstr = u.stringReplace(str, { ["[\u201d]"]: '"', ["[\u2019]"]: "'" }, true, true);
  return eval(pstr);
}
