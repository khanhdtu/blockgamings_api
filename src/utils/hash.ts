import { createHmac } from 'crypto';
import { encrypt, decrypt } from "./crypto";

export const rsaHash = (password: string): string => {
    return encrypt(password);
}

export const sha1Hash = (text: string, salt?: string): string => {
    try {
        const hash = createHmac('sha1', salt ?? '').update(text).digest('hex')
        return hash.toUpperCase()
    } catch (error) {
        console.error('encrypt sha1 error', error)
        return ''
    }
}

export const comparePassword = (providedPass: string, storedPass: string) => {
    const decryptedProvidedPass = decrypt(providedPass);
    const decryptedStoredPass = decrypt(storedPass);
    return decryptedProvidedPass === decryptedStoredPass;
}