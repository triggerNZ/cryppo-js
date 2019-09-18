import { encryptWithKey, encryptWithKeyDerivedFromString } from '../../src/encryption/encryption';
import { CipherStrategy } from '../../src/strategies';

describe('Encryption', () => {
  it('encrypts data with AES-256 GCM Encryption using a string key including derivation artifacts', async done => {
    try {
      const key = 'correct horse battery staple';
      const data = 'some secret data';
      const result = await encryptWithKeyDerivedFromString({
        key,
        data,
        strategy: CipherStrategy.AES_GCM
      });
      expect(result.key).toBeTruthy();
      expect(result.key.length).toEqual(32);
      expect(result.encrypted.length).toEqual(16);
      // Actual length will vary based on key derivation variance
      expect(result.serialized.length).toBeGreaterThan(200);
      expect(result.serialized).toMatch(
        // Head (encryption strategy) should be the same
        // Encrypted data is always 24 characters
        // Chunks of the base64'd YAML (namely, the authData and leading yaml characters) will match
        // and the full length of the yaml should always be the same.
        // Also encludes the key derivation algorithm and artifacts at the end
        /(Aes256Gcm)\..{24}\.LS0tCml2OiAhYmluYXJ5IHwtCiAg(.){75}9PQphZDogbm9uZQo=\.Pbkdf2Hmac\.(.)+/
      );
      done();
    } catch (e) {
      done(e);
    }
  });

  it('encrypts data using a provided key', async done => {
    try {
      const key = `øù@!L DRûÿ­ÙSAaÍÖ¡Ï9£S2îÏ`; // some randomly generated bytes
      const data = 'some secret data';
      const result = await encryptWithKey({
        iv: 'û¶¦ËüqIû',
        key,
        data,
        strategy: CipherStrategy.AES_GCM
      });
      // Known IV and known key should produce the same results
      expect(result.serialized).toEqual(
        // As above although we don't need key derivation artifacts
        // tslint:disable-next-line
        `Aes256Gcm.njxkD8E8FUblb27R6hvN_Q==.LS0tCml2OiAhYmluYXJ5IHwtCiAgKzdhbXl4cjhBWEdQRlVuNwphdDogIWJpbmFyeSB8LQogIHQxa2hBTXBjSStjcENrcWNZUTVxWUE9PQphZDogbm9uZQo=`
      );
      done();
    } catch (e) {
      done(e);
    }
  });
});
