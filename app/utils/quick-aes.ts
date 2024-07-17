import Crypto from 'react-native-quick-crypto';
const getIV = (val: string) => {
    return Crypto.createHash('sha256')
        .update(val)
        .digest('hex')
        .substring(0, 16);
}

const En = (val: string, key: string) => {
    const iv = getIV(key);
    const cipher = Crypto.createCipheriv('aes-128-cbc', iv, iv, {
        padding: 'pkcs7',
    });
    let encryptedData = cipher.update(val, 'utf8', 'hex');

    return encryptedData + cipher.final('hex');
}
const De = (val: string, key: string): string => {
    const iv = getIV(key);
    const decipher = Crypto.createDecipheriv('aes-128-cbc', iv, iv, {
        padding: 'pkcs7',
    });
    let data = decipher.update(val, 'hex', 'utf8');
    return data += decipher.final('utf8');
}
const EnBuffer = (val: Buffer, key: string) => {
    const iv = getIV(key);
    const cipher = Crypto.createCipheriv('aes-128-cbc', iv, iv, {
        padding: 'pkcs7',
    });
    let data = cipher.update(val, 'binary', 'hex')
    data += cipher.final('hex');
    return Buffer.from(data as string, 'hex');
}
const DeBuffer = (val: Buffer, key: string) => {
    const iv = getIV(key);
    
    const decipher = Crypto.createDecipheriv('aes-128-cbc', iv, iv, {
        padding: 'pkcs7',
    });
    let data = decipher.update(val, 'binary', 'hex')
    data += decipher.final('hex');
    return Buffer.from(data as string, 'hex');
}

const EnPadding = (val: Buffer, key: string) => {
    const iv = getIV(key);
    const cipher = Crypto.createCipheriv('aes-128-cbc', iv, iv);
    cipher.setAutoPadding(true)
    let data = cipher.update(val, 'binary', 'hex')
    data += cipher.final('hex');
    return Buffer.from(data as string, 'hex');
}
const DePadding = (val: Buffer, key: string) => {
    const iv = getIV(key);
    const decipher = Crypto.createDecipheriv('aes-128-cbc', iv, iv);
    decipher.setAutoPadding(true)
    let data = decipher.update(val, 'binary', 'hex')
    data += decipher.final('hex');
    return Buffer.from(data as string, 'hex');
}


export default {
    En,
    De,
    EnBuffer,
    DeBuffer,
    EnPadding,
    DePadding
};