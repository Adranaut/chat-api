const crypto = require("crypto");
const algorithm = "aes-256-cbc";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Harus 32 bytes (256 bits)
const IV_LENGTH = 16; // Untuk AES, initialization vector adalah 16 bytes

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  console.error(
    "ENCRYPTION_KEY must be 32 characters long. Generate a strong key!"
  );
  // process.exit(1); // Anda mungkin ingin menghentikan aplikasi jika kunci tidak valid
}

function encrypt(text) {
  if (!ENCRYPTION_KEY) {
    throw new Error("Encryption key is not set or invalid.");
  }
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text) {
  if (!ENCRYPTION_KEY) {
    throw new Error("Encryption key is not set or invalid.");
  }
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = {
  encrypt,
  decrypt,
};
