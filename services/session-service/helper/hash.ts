import * as crypto from 'crypto';

export async function hashThis (password: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    crypto.pbkdf2(password, 'salt', 1000, 64, 'sha256', (err, derivedKey) => {
      if (err != null) {
        reject(err);
      } else {
        resolve(derivedKey.toString('hex'));
      }
    });
  });
}
