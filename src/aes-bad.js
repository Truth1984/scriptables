if (typeof require == "undefined") require = importModule;
const u = require("./awadau");
const un = require("./universe");

// Bad example. window.crypto.subtle doesn't have full support on ios

let mf = () => {
  // Function to generate a random 256-bit AES-GCM encryption key
  function generateEncryptionKey() {
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

    const encryptedMessage = new Uint8Array(encryptedData);

    // Return the IV and the encrypted message as a base64-encoded string
    return {
      iv: arrayBufferToBase64(iv),
      encryptedMessage: arrayBufferToBase64(encryptedMessage),
    };
  }

  // Helper function to convert an ArrayBuffer to a base64-encoded string
  function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary);
  }

  // Example usage:
  const message = "Hello, World!";
  generateEncryptionKey()
    .then((encryptionKey) => encryptMessage(message, encryptionKey))
    .then((encrypted) => {
      console.log({ encrypted });
    })
    .catch((error) => {
      console.error({ error });
    });
};

u.log(un.eval(mf));
