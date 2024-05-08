// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: upload;

if (typeof require == "undefined") require = importModule;
const u = require("./awadau");
const un = require("./universe");
console.log = u.consoleLog;

// shortcut example:
// url: 'example.com'
// method: 'post'
// body: {v:10}

/**
 * can add multiple header and body in shortcut text
 *@return {{
 *   url: string,
 *   method: "post" | "get",
 *   header: {},
 *   body: {}
 * }}
 */
let analyze = () => {
  let params = args.plainTexts;
  let result = {};
  params.map((i) => {
    if (!i) return;

    let item = i ? u.stringToJson(eval("({" + i + "})")) : {};
    let key = u.mapKeys(item)[0];
    result[key] = u.typeCheck(item[key], "str") ? item[key] : u.mapMerge(result[key], item[key]);
  });
  return result;
};

let { url, method, header, body } = analyze();

// debug
// throw u.jsonToString(analyze());

if (!url) throw "Request: url not present";

let requestResult = method == "get" ? u.promiseFetchGet(url, header) : u.promiseFetchPost(url, body, header);
requestResult
  .then((result) => un.shortcutComplete(result ? result : ""))
  .catch((e) => {
    throw e;
  });
