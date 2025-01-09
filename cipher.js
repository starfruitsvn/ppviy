const crypto = require('crypto');

class Cipher {
  constructor(secretKey = '') {
    this.secretKey = secretKey;
  }

  // XOR encryption & decryption using the secret key
  _xor(bytes, keys) {
    return bytes.map((e, i) => e ^ keys[i % keys.length]);
  }

  // Bytes encryption, without a secret key just XOR with its next byte
  _encrypt(bytes) {
    const encrypted = [...bytes];
    const length = encrypted.length;
    for (let i = 0; i < length; i++) {
      const j = (i + 1 >= length) ? 0 : i + 1;
      encrypted[i] = encrypted[i] ^ encrypted[j];
    }
    return encrypted;
  }

  // Bytes decryption, without a secret key just XOR with its next byte
  _decrypt(bytes) {
    const decrypted = [...bytes];
    const length = decrypted.length;
    for (let i = length - 1; i >= 0; i--) {
      const j = (i + 1 >= length) ? 0 : i + 1;
      decrypted[i] = decrypted[i] ^ decrypted[j];
    }
    return decrypted;
  }

  // String XOR encryption
  xorEncode(content, secretKey = this.secretKey) {
    const keyBytes = Buffer.from(secretKey, 'utf8');
    const contentBytes = Buffer.from(content, 'utf8');
    const result = secretKey ? this._xor([...contentBytes], [...keyBytes]) : this._encrypt([...contentBytes]);
    return Buffer.from(result).toString('base64');
  }

  // String XOR decryption
  xorDecode(content, secretKey = this.secretKey) {
    const keyBytes = Buffer.from(secretKey, 'utf8');
    const contentBytes = Buffer.from(content, 'base64');
    const result = secretKey ? this._xor([...contentBytes], [...keyBytes]) : this._decrypt([...contentBytes]);
    return Buffer.from(result).toString('utf8');
  }

  // Bytes XOR encryption
  xorEncodeBytes(bytes, secretKey = this.secretKey) {
    const keyBytes = Buffer.from(secretKey, 'utf8');
    return secretKey ? this._xor(bytes, [...keyBytes]) : this._encrypt(bytes);
  }

  // Bytes XOR decryption
  xorDecodeBytes(bytes, secretKey = this.secretKey) {
    const keyBytes = Buffer.from(secretKey, 'utf8');
    return secretKey ? this._xor(bytes, [...keyBytes]) : this._decrypt(bytes);
  }

  // Bytes to string XOR encryption
  xorEncodeBytesToString(bytes, secretKey = this.secretKey) {
    const result = this.xorEncodeBytes(bytes, secretKey);
    return Buffer.from(result).toString('base64');
  }

  // Bytes to string XOR decryption
  xorDecodeStringToBytes(content, secretKey = this.secretKey) {
    const bytes = Buffer.from(content, 'base64');
    return this.xorDecodeBytes([...bytes], secretKey);
  }

  // String to bytes XOR encryption
  xorEncodeStringToBytes(content, secretKey = this.secretKey) {
    const bytes = Buffer.from(content, 'utf8');
    return this.xorEncodeBytes([...bytes], secretKey);
  }

  // String to bytes XOR decryption
  xorDecodeBytesToString(bytes, secretKey = this.secretKey) {
    const result = this.xorDecodeBytes(bytes, secretKey);
    return Buffer.from(result).toString('utf8');
  }
}

module.exports = Cipher;
