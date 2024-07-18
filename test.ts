import Crypto from 'node:crypto';
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
        encrypted,
        authTag,
    ]))
}
const De = (password: string, data: Uint8Array): Uint8Array => {
    const key = Crypto.createHash('sha256').update(password).digest();
    const iv = data.slice(0, 12);
    let encrypted = data.slice(12);
    const authTag = encrypted.slice(encrypted.length - 16, encrypted.length);
    const decipher = Crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted.slice(0, encrypted.length - 16));
    decrypted = Buffer.concat([decrypted as Buffer, decipher.final() as Buffer]);
    return new Uint8Array(decrypted);
}

(async () => {
    const password = "1234561111111111";
    const data = "中国人";
    const encrypted = En(password, new Uint8Array(Buffer.from(data)));
    console.log(Buffer.from(De(password, encrypted)).toString('utf8'));

})()