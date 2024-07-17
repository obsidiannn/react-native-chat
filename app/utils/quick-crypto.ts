import Crypto from 'react-native-quick-crypto';
const En = (password: string, data: Uint8Array) => {
    const key = Crypto.createHash('sha256').update(password).digest();
    const iv = Crypto.randomBytes(12);
    const cipher = Crypto.createCipheriv('aes-256-gcm', key, iv,{
        authTagLength: 16
    });
    let encrypted = cipher.update(Buffer.from(data));
    encrypted = Buffer.concat([encrypted as Buffer, cipher.final() as Buffer]);
    const authTag = cipher.getAuthTag();
    return new Uint8Array(Buffer.concat([
        iv,
        authTag,
        encrypted
    ]))
}
const De = (password: string, data: Uint8Array): Uint8Array => {
    const key = Crypto.createHash('sha256').update(password).digest();
    const iv = data.slice(0, 12);
    const authTag = data.slice(12, 28);
    const encrypted = data.slice(28);
    const decipher = Crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted as Buffer, decipher.final() as Buffer]);
    return new Uint8Array(decrypted);
}
export default {
    En,
    De
};