import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = '12345678901234567890123456789012'; // 32 characters for AES-256-CBC
const IV_LENGTH = 16; // AES block size (16 bytes)

export const encryptPayload = (data: object) => {
  // Create the key and IV from the ENCRYPTION_KEY
  const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
  const iv = CryptoJS.lib.WordArray.random(IV_LENGTH); // Random IV for each request

  // Convert data to string (if it's not already)
  const stringifiedData = JSON.stringify(data);

  // Encrypt the data with AES-256-CBC
  const encrypted = CryptoJS.AES.encrypt(stringifiedData, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  // Return the IV and encrypted data in Hex format
  return {
    iv: iv.toString(CryptoJS.enc.Hex),
    encryptedData: encrypted.ciphertext.toString(CryptoJS.enc.Hex),
  };
};

interface EncryptedData {
  iv: string;
  encryptedData: string;
}

export const decryptResponse = <T>(encryptedResponse: EncryptedData): T => {
  const { iv, encryptedData } = encryptedResponse;

  // Create the key from the ENCRYPTION_KEY
  const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
  const ivParsed = CryptoJS.enc.Hex.parse(iv);

  // Convert the encrypted data from hex to WordArray
  const ciphertext = CryptoJS.enc.Hex.parse(encryptedData);

  // Create cipher params object
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: ciphertext,
  });

  // Decrypt the data
  const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
    iv: ivParsed,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  // Convert the decrypted data to string and parse as JSON
  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8)) as T;
};
