// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: vial;

// Author: Awada.Z

if (typeof require == "undefined") require = importModule;
const u = require("./awadau");
console.log = u.consoleLog;

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
  if (u.equal(keys, [])) return content;
  return u.mapGet(content, ...keys);
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

un.paramEval = () => {
  let param = args.plainTexts;
  if (param != undefined) {
    str = u.arrayToString(args.plainTexts, "");
    pstr = u.stringReplace(str, { ["[\u201d]"]: '"', ["[\u2019]"]: "'" }, true, true);
    return eval(pstr);
  }
};

un.shortcutComplete = (value = "") => {
  Script.setShortcutOutput(value);
  Script.complete();
};

un.eval = async (func, ...args) => {
  let wv = new WebView();
  await wv.loadHTML("<html />", "https://localhost").catch((e) => ({ method: "loadUrl", error: e.toString() }));
  let prep = `
    let myfunc = async () => {
      let f = ${func.toString()};
      return f(...${u.jsonToString(args)})
    }
    setTimeout(myfunc().then(data=>completion({ok:true,data})).catch(e=>completion({ok:false,data:e.toString()})))
    `;
  return (
    wv
      .evaluateJavaScript(prep, true)
      .then((result) => {
        if (!result || u.isBad(result.ok)) return Promise.reject("Error: Data not retrieved");
        if (result.ok) return result.data;
        return Promise.reject(result.data);
      })
      // Ketchup for Scriptable spaghetti code
      .catch(async (e) => Promise.reject((await e).toString()))
  );
};

/**
 *
 * @param {string | {url:string, saveWeb: boolean, htmlPath: "./web.html"}} option url as default
 * @param {} func
 * @param  {...any} args
 * @returns
 */
un.evalOnWeb = async (option = {}, func, ...args) => {
  let wv = new WebView();
  let { url, saveWeb, htmlPath } = u.typeCheck(option, "map") ? option : {};
  if (u.typeCheck(option, "str")) url = option;
  await wv.loadURL(u.url(url)).catch((e) => ({ method: "loadUrl", error: e.toString() }));
  if (!htmlPath) htmlPath = "./web.html";
  if (saveWeb) wv.getHTML().then((content) => FileManager.local().writeString(htmlPath, content));
  let prep = `
    let myfunc = async () => {
      let f = ${func.toString()};
      return f(...${u.jsonToString(args)})
    }
    setTimeout(myfunc().then(data=>completion({ok:true,data})).catch(e=>completion({ok:false,data:e.toString()})))
    `;
  return (
    wv
      .evaluateJavaScript(prep, true)
      .then((result) => {
        if (!result || u.isBad(result.ok)) return Promise.reject("Error: Data not retrieved");
        if (result.ok) return result.data;
        return Promise.reject(result.data);
      })
      // Ketchup for Scriptable spaghetti code
      .catch(async (e) => Promise.reject((await e).toString()))
  );
};

/**
 * 
 * example1: un.AES({
    key: "y2CRj6hjnaOBb9TZxa7Dz7TgkUui1e+kx16K/okP2ss=",
    iv: "DBe1Ozb3aMRDn94Y",
    toDecrypt: "nmtLp3sLvkEaPA1EF/juXld3TadMFlM3276nXw==",
  })
 *
 * example2: un.AES({toEncrypt:"greetings"})
 * 
 * use const { webcrypto } = require("crypto"); const { TextDecoder } = require("util"); on latest node version
 * 
 * @param {{key:string, iv:string, toEncrypt:string, toDecrypt:string}} info
 * @returns {Promise<{key:string, iv:string, message:string, encrypt:boolean, result:string}>}
 */
un.AES = (info = {}) => {
  let f = async (key, iv, toEncrypt, toDecrypt) => {
    const arrayBufferToBase64 = (buffer) => {
      let binary = "";
      const bytes = new window.Uint8Array(buffer);
      const len = bytes.byteLength;

      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }

      return window.btoa(binary);
    };

    const base64ToArrayBuffer = (base64) => {
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);

      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return bytes.buffer;
    };

    let generateEncryptionKey = async () => {
      let encryptKey = await window.crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
        "encrypt",
        "decrypt",
      ]);
      raw64Key = await window.crypto.subtle.exportKey("raw", encryptKey).then((key) => arrayBufferToBase64(key));
      return encryptKey;
    };

    let encryptMessage = async (message) => {
      let messageBuffer = new TextEncoder().encode(message);
      let encryptedData = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv,
        },
        key,
        messageBuffer
      );
      let encryptedMessage = new window.Uint8Array(encryptedData);

      return arrayBufferToBase64(encryptedMessage);
    };

    let decryptMessage = async (encryptedMessage) => {
      let encryptedData = base64ToArrayBuffer(encryptedMessage);
      let decryptedData = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        key,
        encryptedData
      );
      let decryptedMessage = new window.TextDecoder().decode(decryptedData);

      return decryptedMessage;
    };

    let raw64Key = key;
    let raw64iv = iv;

    if (key)
      key = await window.crypto.subtle.importKey(
        "raw",
        base64ToArrayBuffer(key),
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );
    else key = await generateEncryptionKey();

    if (iv) iv = base64ToArrayBuffer(iv);
    else {
      iv = await window.crypto.getRandomValues(new Uint8Array(12));
      raw64iv = arrayBufferToBase64(iv);
    }

    if (toEncrypt) {
      return {
        key: raw64Key,
        iv: raw64iv,
        message: toEncrypt,
        encrypt: true,
        result: await encryptMessage(toEncrypt),
      };
    }

    if (toDecrypt) {
      return {
        key: raw64Key,
        iv: raw64iv,
        message: toDecrypt,
        encrypt: false,
        result: await decryptMessage(toDecrypt),
      };
    }
  };

  return un.eval(f, info.key, info.iv, info.toEncrypt, info.toDecrypt);
};

module.exports = un;
