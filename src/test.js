if (typeof require == "undefined") require = importModule;
const u = require("./awadau");
const un = require("./universe");

u.log(
  un.AES({
    key: "y2CRj6hjnaOBb9TZxa7Dz7TgkUui1e+kx16K/okP2ss=",
    iv: "DBe1Ozb3aMRDn94Y",
    toDecrypt: "nmtLp3sLvkEaPA1EF/juXld3TadMFlM3276nXw==",
  })
);
