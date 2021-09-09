import NodeRSA from 'node-rsa';
import { privateDecrypt } from 'crypto';
import env from 'dotenv';
import { formatKey } from './func';
env.config();

const PRIVATE_KEY = formatKey(process.env.PRIVATE_KEY ?? '');

export const encrypt = (text: string) => {
  try {
    const rsa = new NodeRSA(PRIVATE_KEY ?? '');
    return rsa.encrypt(text, 'base64');
  } catch (error) {
    console.error(`encrypt error: ${error}`);
    return 'INVALID';
  }
};

export const decrypt = (text: string) => {
  try {
    const rsa = new NodeRSA(PRIVATE_KEY ?? '');
    return rsa.decrypt(text, 'utf8');
  } catch (error) {
    console.error(`decrypt error: ${error}`);
    return 'INVALID';
  }
};

export const decryptWithRsa = (text: string): string => {
  try {
    const privateKey = { key: PRIVATE_KEY }
    const buffer = Buffer.from(text, 'base64')
    const decrypted = privateDecrypt(privateKey, buffer)
    return decrypted.toString('utf8')
  } catch (error) {
    console.error(`decrypt error: ${error}`);
    return 'INVALID';
  }
}

export const generate = () => {
  try {
    const rsa = new NodeRSA({b: 512});
    const keyPair = rsa.generateKeyPair();
    const publicKey = keyPair.exportKey('pkcs8-public-pem');
    const privateKey = keyPair.exportKey('pkcs8-private-pem');
    return {publicKey, privateKey};
  } catch (error) {
    console.error(`generate key pair error: ${error}`);
    return {publicKey: 'INVALID', privateKey: 'INVALID'};
  }
};