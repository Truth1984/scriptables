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

un._cachePrep = (cloud = false, filename = "variable.json", content = "[]") => {
  let uid = un._cacheUid();
  let cacheDir = "./scriptable-cache/";
  let cacheDb = cacheDir + filename;
  let fml = FileManager.local();
  let fmc = FileManager.iCloud();
  let fm = cloud ? fmc : fml;

  if (cloud) {
    cacheDir = fmc.joinPath(fmc.documentsDirectory(), cacheDir);
    cacheDb = fmc.joinPath(fmc.documentsDirectory(), cacheDb);
    if (!fmc.isDirectory(cacheDir)) fmc.createDirectory(cacheDir);
    if (!fmc.fileExists(cacheDb)) fmc.writeString(cacheDb, content);
  } else {
    cacheDir = fml.joinPath(fml.cacheDirectory(), cacheDir);
    cacheDb = fml.joinPath(fml.cacheDirectory(), cacheDb);
    if (!fml.isDirectory(cacheDir)) fml.createDirectory(cacheDir);
    if (!fml.fileExists(cacheDb)) fml.writeString(cacheDb, content);
  }

  return { uid, fm, cachePath: cacheDb, cacheDir };
};

un._cachePrepConf = (cloud = false) => {
  return un._cachePrep(cloud, "config.json", "{}");
};

un.cacheDeleteFile = (cloud = false) => {
  let { fm, cacheDir } = un._cachePrep(cloud);
  fm.remove(cacheDir);
};

un.confDeleteFile = (cloud = false) => {
  let { fm, cacheDir } = un._cachePrepConf(cloud);
  fm.remove(cacheDir);
};

un.cacheAdd = (pairs = {}, cloud = false) => {
  let { fm, uid, cachePath } = un._cachePrep(cloud);
  pairs._id = un.uuid();
  pairs._date = new Date();
  pairs._device = uid;

  let content = JSON.parse(fm.readString(cachePath));
  content = u.arrayAdd(content, pairs);
  content = u.jsonToString(content);
  fm.writeString(cachePath, content);
};

un.cacheSet = (data = {}, identifier = {}, cloud = false) => {
  let { fm, cachePath } = un._cachePrep(cloud);
  let content = JSON.parse(fm.readString(cachePath));
  data._id = un.uuid();
  data._date = new Date();
  data._device = uid;

  content = content.map((item) => {
    if (u.contains(item, identifier)) return data;
    return item;
  });
  content = u.jsonToString(content);
  fm.writeString(cachePath, content);
};

un.confSet = (data = {}, cloud = false) => {
  let { fm, cachePath } = un._cachePrepConf(cloud);
  let content = JSON.parse(fm.readString(cachePath));
  content = u.mapMerge(content, data);
  content = u.jsonToString(content);
  fm.writeString(cachePath, content);
};

un.cacheMerge = (data = {}, identifier = {}, cloud = false) => {
  let { fm, cachePath } = un._cachePrep(cloud);
  let content = JSON.parse(fm.readString(cachePath));
  content = content.map((item) => {
    if (u.contains(item, identifier)) return u.mapMerge(item, data, { _update: new Date() });
    return item;
  });
  content = u.jsonToString(content);
  fm.writeString(cachePath, content);
};

un.cacheDelete = (identifier = {}, cloud = false) => {
  let { fm, cachePath } = un._cachePrep(cloud);
  let content = u.stringToJson(fm.readString(cachePath));
  content = content.filter((item) => !u.contains(item, identifier));
  content = u.jsonToString(content);
  fm.writeString(cachePath, content);
};

un.confDelete = (keys = [], cloud = false) => {
  let { fm, cachePath } = un._cachePrepConf(cloud);
  let content = u.stringToJson(fm.readString(cachePath));
  if (u.typeCheck(keys, "str")) keys = [keys];
  keys.forEach((key) => delete content[key]);
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

un.confGet = (keys = [], cloud = false) => {
  let { fm, cachePath } = un._cachePrepConf(cloud);
  let content = u.stringToJson(fm.readString(cachePath));
  if (u.typeCheck(keys, "str")) keys = [keys];
  return keys.map((key) => content[key]);
};

un.cacheGetOne = (identifier = {}, cloud = false) => {
  let { fm, cachePath } = un._cachePrep(cloud);
  let content = u.stringToJson(fm.readString(cachePath));
  for (let i of content) if (u.contains(i, identifier)) return i;
};

un.confGetOne = (key = "", cloud = false) => {
  let { fm, cachePath } = un._cachePrepConf(cloud);
  let content = u.stringToJson(fm.readString(cachePath));
  return content[key];
};

un.copyString = (string) => Pasteboard.copyString(string);

un.copyImg = (img) => Pasteboard.copyImage(img);

un.pasteString = () => Pasteboard.pasteString();

/**
 * @return {{c:?string}}
 */
un.pasteImg = () => Pasteboard.pasteImage();

/**
 *
 * @param {0 | 1 | 2 | 3 | 4} vagueLevel lower is more accurate
 * @return {Promise<{"verticalAccuracy":number, "altitude":number, "latitude":number, "longitude":number,"horizontalAccuracy":number}>}
 */
un.locationNum = async (vagueLevel = 0) => {
  let loc = Location;
  if (vagueLevel == 0) loc.setAccuracyToBest();
  if (vagueLevel == 1) loc.setAccuracyToTenMeters();
  if (vagueLevel == 2) loc.setAccuracyToHundredMeters();
  if (vagueLevel == 3) loc.setAccuracyToKilometer();
  if (vagueLevel > 3) loc.setAccuracyToThreeKilometers();
  return loc.current();
};

/**
 *
 * @param {0 | 1 | 2 | 3 | 4} vagueLevel lower is more accurate
 * @param {?string} locale Preferred locale to fetch information in as `Device.locale()`
 */
un.locationDetailFull = async (vagueLevel = 0, locale) => {
  let locData = await un.locationNum(vagueLevel);
  return Location.reverseGeocode(locData.latitude, locData.longitude);
};

/**
 *
 * @param {0 | 1 | 2 | 3 | 4} vagueLevel lower is more accurate
 * @param {?string} locale Preferred locale to fetch information in as `Device.locale()`
 * @return {Promise<{
 "areasOfInterest":?string, "subThoroughfare":?string, "inlandWater":?string, 
 "isoCountryCode":?string, "ocean":?string, "subLocality":?string, 
 "country":?string, "thoroughfare":?string, "name":?string, 
 "location":{"verticalAccuracy":number, "altitude":number, "latitude":number, 
 "longitude":number,"horizontalAccuracy":number }, 
 "subAdministrativeArea":?string, "postalCode":?string, 
 "locality":?string, "administrativeArea":?string, "timeZone":?string ,
 "postalAddress":{"postalCode":?string, "subAdministrativeArea":?string, "city":?string, 
 "subLocality":?string, "state":?string, "street":?string, "country":?string, 
 "isoCountryCode":?string} 
 }>}
 */
un.locationDetail = async (vagueLevel = 0, locale) => {
  let locData = await un.locationNum(vagueLevel);
  let result = await Location.reverseGeocode(locData.latitude, locData.longitude);
  result = result && result[0] ? result[0] : {};
  return u.mapMerge(result, { location: locData });
};

un.speak = (string) => {
  Speech.speak(string);
};

un.base64ToImg = (base64String) => {
  return Image.fromData(Data.fromBase64String(base64String));
};

module.exports = un;
