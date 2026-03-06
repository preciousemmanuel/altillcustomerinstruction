import { toLowerCaseKeys } from '@/utils/jwtToken';
import CryptoJS from 'crypto-js';

// Configuration keys matching C# backend
// In a real app, these should properly be environment variables, but for now matching the provided hardcoded values/logic
const CONFIG = {
    InitVector: import.meta.env.VITE_ENCRYPTION_IV,
    PassPhrase: import.meta.env.VITE_ENCRYPTION_PASSPHRASE,
    SaltValue: import.meta.env.VITE_ENCRYPTION_SALT,
    PasswordIterations: Number(import.meta.env.VITE_ENCRYPTION_ITERATIONS) || 2,
    KeySize: (Number(import.meta.env.VITE_ENCRYPTION_KEY_SIZE) || 256) / 32 // 256 bits = 32 bytes
};

export class EncryptionService {
    private key: CryptoJS.lib.WordArray;
    private iv: CryptoJS.lib.WordArray;

    constructor() {
        this.key = this.deriveKey();
        this.iv = CryptoJS.enc.Utf8.parse(CONFIG.InitVector || "");
    }

    private deriveKey(): CryptoJS.lib.WordArray {
        // C#: new Rfc2898DeriveBytes(passPhrase, saltValueBytes, passwordIterations)
        // Default Rfc2898DeriveBytes uses HMACSHA1
        const salt = CryptoJS.enc.Utf8.parse(CONFIG.SaltValue || "");

        return CryptoJS.PBKDF2(CONFIG.PassPhrase || "", salt, {
            keySize: CONFIG.KeySize, // 8 words = 32 bytes = 256 bits
            iterations: CONFIG.PasswordIterations,
            hasher: CryptoJS.algo.SHA1
        });
    }

    public encrypt(data: any): string {
        if (!data) return "";

        let clearText = "";
        if (typeof data === "string") {
            clearText = data;
        } else {
            clearText = JSON.stringify(data);
        }

        const encrypted = CryptoJS.AES.encrypt(clearText, this.key, {
            iv: this.iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return encrypted.toString(); // Base64 by default
    }

    public decrypt(cipherText: string): any {
        if (!cipherText) return null;

        try {
            const decrypted = CryptoJS.AES.decrypt(cipherText, this.key, {
                iv: this.iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
            if (!decryptedString) return null;

            try {
                return toLowerCaseKeys(JSON.parse(decryptedString));
            } catch {
                return decryptedString;
            }
        } catch (error) {
            console.error("Decryption failed", error);
            return null;
        }
    }
}

export const encryptionService = new EncryptionService();
