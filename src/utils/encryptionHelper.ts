import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY_NEW;
const IV_LENGTH = 16;

// encryption
export const encryptPayload = (data: object) => {
  const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
  const iv = CryptoJS.lib.WordArray.random(IV_LENGTH);
  const stringifiedData = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(stringifiedData, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return {
    iv: iv.toString(CryptoJS.enc.Hex),
    encryptedData: encrypted.ciphertext.toString(CryptoJS.enc.Hex),
  };
};

interface EncryptedData {
  iv: string;
  encryptedData: string;
}

// decryption
export const decryptResponse = <T>(encryptedResponse: EncryptedData): T => {
  const { iv, encryptedData } = encryptedResponse;
  const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
  const ivParsed = CryptoJS.enc.Hex.parse(iv);
  const ciphertext = CryptoJS.enc.Hex.parse(encryptedData);
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: ciphertext,
  });
  const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
    iv: ivParsed,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8)) as T;
};
