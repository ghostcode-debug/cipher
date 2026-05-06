const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');

class CipherEncryption {
  constructor() {
    this.keyPair = null;
    this.sharedSecrets = {}; // Store shared secrets per user
  }

  // Generate keypair for user
  generateKeyPair() {
    this.keyPair = nacl.box.keyPair();
    return {
      publicKey: naclUtil.encodeBase64(this.keyPair.publicKey),
      secretKey: naclUtil.encodeBase64(this.keyPair.secretKey)
    };
  }

  // Store secret key (received from server during login)
  setSecretKey(secretKeyBase64) {
    this.keyPair = {
      secretKey: naclUtil.decodeBase64(secretKeyBase64),
      publicKey: null // Will be set when needed
    };
  }

  // Compute shared secret with another user's public key
  computeSharedSecret(otherUserPublicKeyBase64, userId) {
    const otherPublicKey = naclUtil.decodeBase64(otherUserPublicKeyBase64);
    const sharedSecret = nacl.box.before(otherPublicKey, this.keyPair.secretKey);
    this.sharedSecrets[userId] = sharedSecret;
    return sharedSecret;
  }

  // Encrypt message
  encryptMessage(message, userId) {
    if (!this.sharedSecrets[userId]) {
      throw new Error('Shared secret not computed for user: ' + userId);
    }

    const nonce = nacl.randomBytes(24);
    const messageBytes = naclUtil.decodeUTF8(message);
    const sharedSecret = this.sharedSecrets[userId];

    const encrypted = nacl.box.after(messageBytes, nonce, sharedSecret);

    return {
      ciphertext: naclUtil.encodeBase64(encrypted),
      nonce: naclUtil.encodeBase64(nonce)
    };
  }

  // Decrypt message
  decryptMessage(ciphertext, nonce, userId) {
    if (!this.sharedSecrets[userId]) {
      throw new Error('Shared secret not computed for user: ' + userId);
    }

    const ciphertextBytes = naclUtil.decodeBase64(ciphertext);
    const nonceBytes = naclUtil.decodeBase64(nonce);
    const sharedSecret = this.sharedSecrets[userId];

    try {
      const decrypted = nacl.box.open.after(ciphertextBytes, nonceBytes, sharedSecret);
      return naclUtil.encodeUTF8(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Message decryption failed');
    }
  }

  // Get public key
  getPublicKeyBase64() {
    if (!this.keyPair || !this.keyPair.publicKey) {
      throw new Error('Keypair not initialized');
    }
    return naclUtil.encodeBase64(this.keyPair.publicKey);
  }
}

// Create singleton instance
const cipher = new CipherEncryption();

// Export for use in browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CipherEncryption;
}
