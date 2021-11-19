// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: vial;

// Author: Awada.Z

if (typeof require == "undefined") require = importModule;
const u = require("./awadau");

let un = {};

un.uuid = () => UUID.string();

un._cacheUid = () => {
  let fml = FileManager.local();
  let uidPath = fml.joinPath(fml.cacheDirectory(), "iuid");
  if (!fml.fileExists(uidPath)) fml.writeString(uidPath, un.uuid());
  return fml.readString(uidPath);
};

un.uuidMine = () => un._cacheUid();

un._cachePrep = (cloud = false) => {
  let uid = un._cacheUid();
  let cacheDir = "./scriptable-cache";
  let cacheDb = "./scriptable-cache/variable.json";
  let fml = FileManager.local();
  let fmc = FileManager.iCloud();
  let fm = cloud ? fmc : fml;

  if (cloud) {
    cacheDir = fmc.joinPath(fmc.documentsDirectory(), cacheDir);
    cacheDb = fmc.joinPath(fmc.documentsDirectory(), cacheDb);
    if (!fmc.isDirectory(cacheDir)) fmc.createDirectory(cacheDir);
    if (!fmc.fileExists(cacheDb)) fmc.writeString(cacheDb, "[]");
  } else {
    cacheDir = fml.joinPath(fml.cacheDirectory(), cacheDir);
    cacheDb = fml.joinPath(fml.cacheDirectory(), cacheDb);
    if (!fml.isDirectory(cacheDir)) fml.createDirectory(cacheDir);
    if (!fml.fileExists(cacheDb)) fml.writeString(cacheDb, "[]");
  }

  return { uid, fm, cachePath: cacheDb, cacheDir };
};

un.cacheDeleteFile = () => {
  let { fm, cacheDir } = un._cachePrep();
  fm.remove(cacheDir);
};

un.cacheSet = (pairs = {}, cloud = false) => {
  let { fm, uid, cachePath } = un._cachePrep(cloud);
  pairs._id = un.uuid();
  pairs._date = new Date();
  pairs._device = uid;

  let content = JSON.parse(fm.readString(cachePath));
  content = u.arrayAdd(content, pairs);
  content = u.jsonToString(content);
  fm.writeString(cachePath, content);
};

un.cacheGet = (identifier = {}, cloud = false) => {
  let { fm, cachePath } = un._cachePrep(cloud);
  let content = u.stringToJson(fm.readString(cachePath));
  return content.filter((item) => {
    if (u.contains(item, identifier)) return item;
  });
};

un.cacheGetOne = (identifier = {}, cloud = false) => {
  let { fm, cachePath } = un._cachePrep(cloud);
  let content = u.stringToJson(fm.readString(cachePath));
  for (let i of content) if (u.contains(i, identifier)) return i;
};

module.exports = un;
