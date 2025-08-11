const crypto = require('crypto');
const config = require('../configs/config');

class EncryptionService {
  static hashSensitiveData(data) {
    const salt = crypto.randomBytes(32);
    const hash = crypto.scryptSync(data, salt, 64);
    return {
      hash: hash.toString('hex'),
      salt: salt.toString('hex'),
    };
  }

  static verifySensitiveData(data, storedHash, storedSalt) {
    const hash = crypto.scryptSync(data, Buffer.from(storedSalt, 'hex'), 64);
    return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), hash);
  }
}

module.exports = EncryptionService;
