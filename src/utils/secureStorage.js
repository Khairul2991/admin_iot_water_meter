// utils/secureStorage.js
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.REACT_APP_STORAGE_SECRET_KEY;

export const secureStorage = {
  setItem: (key, data) => {
    try {
      const encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify(data),
        SECRET_KEY
      ).toString();
      localStorage.setItem(key, encryptedData);
    } catch (error) {
      console.error("Error encrypting data:", error);
    }
  },

  getItem: (key) => {
    try {
      const encryptedData = localStorage.getItem(key);
      if (!encryptedData) return null;

      const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error("Error decrypting data:", error);
      return null;
    }
  },

  removeItem: (key) => {
    localStorage.removeItem(key);
  },

  clear: () => {
    localStorage.clear();
  },
};
