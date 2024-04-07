if (typeof require == "undefined") require = importModule;
const u = require("./awadau");
const un = require("./universe");

// Bad example. window.crypto.subtle doesn't have full support on ios
// https://webkit.org/blog/7790/update-on-web-cryptography/
// bullshit on ios

let mf = () => {
  // Function to generate a random 256-bit AES-GCM encryption key
  async function generateEncryptionKey() {
    return window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true, // extractable
      ["encrypt", "decrypt"] // key usages
    );
  }

  // Function to encrypt a message using AES-GCM
  async function encryptMessage(message, encryptionKey) {
    const messageBuffer = new TextEncoder().encode(message);

    // Generate a random initialization vector (IV)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      encryptionKey,
      messageBuffer
    );

    const encryptedMessage = new window.Uint8Array(encryptedData);

    // Return the IV and the encrypted message as a base64-encoded string
    return {
      iv: arrayBufferToBase64(iv),
      encryptedMessage: arrayBufferToBase64(encryptedMessage),
    };
  }

  // Helper function to convert an ArrayBuffer to a base64-encoded string
  function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new window.Uint8Array(buffer);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary);
  }

  // Function to decrypt a message using AES-GCM
  async function decryptMessage(encryptedMessage, encryptionKey) {
    const iv = base64ToArrayBuffer(encryptedMessage.iv);
    const encryptedData = base64ToArrayBuffer(encryptedMessage.encryptedMessage);

    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      encryptionKey,
      encryptedData
    );

    const decryptedMessage = new window.TextDecoder().decode(decryptedData);

    return decryptedMessage;
  }

  // Helper function to convert a base64-encoded string to an ArrayBuffer
  function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new window.Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
  }

  // Example usage:
  const message = "Hello, World!";
  let result = { message, step: 0 };

  generateEncryptionKey()
    .then((encryptionKey) => {
      // error on ios
      // no result on mac scriptable
      // functional on chrome +
      result.encryptionKey = encryptionKey;
      result.step += 1;
      console.log(result);
      return encryptMessage(message, encryptionKey);
    })
    .then((encrypted) => {
      // fine on mac scriptable +
      result.encrypted = encrypted;
      result.step += 1;
      console.log(result);
      return decryptMessage(encrypted, result.encryptionKey);
    })
    .then((decryptedData) => {
      result.decryptedData = decryptedData;
      result.step += 1;
      console.log(result);
      return result;
    })
    .catch((error) => {
      result.error = error;
      console.error(result);
    });
};

u.log(un.eval(mf));
