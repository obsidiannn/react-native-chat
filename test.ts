import * as Crypto from 'node:crypto';
export const passwordHash = (password: string) => {
    const bin = passwordToBin(password);
    return {
        top: Buffer.from(bin.top).toString("hex"),
        bottom: Buffer.from(bin.bottom).toString("hex")
    }
}
export const passwordToBin = (password: string) => {
    const hash = new Uint8Array(Crypto.createHash('sha256').update(password).digest());
    return {
        top: hash.slice(0, 16),
        bottom: hash.slice(16, 32)
    };
}
export const binToPasswordHash = (bin: Uint8Array) => Buffer.from(bin).toString('hex')
export const initContainer = () => {
    const items: Array<Uint8Array> = []
    for (let i = 0; i < 10; i++) {
        items.push(new Uint8Array(100))
    }
    return items;
}


let container = initContainer();
export const loadContainer = () => {
    return container;
}
export const dump = () => {
    const items = loadContainer();
    return Buffer.concat(items).toString('hex');
}
export const dePriKey = (password: string, encrypted: Uint8Array) => {
    const key = Crypto.createHash('sha256').update(password).digest();
    const iv = encrypted.slice(0,12);
    const authTag = encrypted.slice(12,28);
    const ciphertext = encrypted.slice(28);
    const decipher = Crypto.createDecipheriv('aes-256-gcm', key, iv,{
        authTagLength: 16
    });
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(ciphertext);
    decrypted = Buffer.concat([decrypted as Buffer, decipher.final() as Buffer]);
    return new Uint8Array(decrypted);
}
export const enPriKey = (password: string, priKey: Uint8Array) => {
    const key = Crypto.createHash('sha256').update(password).digest();
    const iv = Crypto.randomBytes(12)
    const cipher = Crypto.createCipheriv('aes-256-gcm', key, iv,{
        authTagLength: 16
    });
    let encrypted = cipher.update(priKey);
    encrypted = Buffer.concat([encrypted as Buffer, cipher.final() as Buffer]);
    const authTag = cipher.getAuthTag();
    return new Uint8Array(Buffer.concat([
        iv,
        authTag,
        encrypted
    ]))
}
export const writePriKey = async (password: string, priKey: string) => {
    if(priKey.startsWith('0x')){
        priKey = priKey.substring(2)
    }
    const items = loadContainer();
    const pwdBin = passwordToBin(password);
    const pwdHash = passwordHash(password);
    const passwordHashList: string[] = [];
    for (const item of items) {
        if (item[0] == 1) {
            passwordHashList.push(binToPasswordHash(item.slice(2, 18)));
        }
    }
    if (passwordHashList.includes(pwdHash.top)) {
        throw new Error('密码已被占用');
    }
    const priKeyBuffer = new Uint8Array(Buffer.from(priKey, "hex"))
    const enData = enPriKey(pwdHash.bottom, priKeyBuffer);
    let isWrite = false
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item[0] == 0) {
            item[0] = 1;
            item[1] = enData.length;
            for (let j = 2; j < 18; j++) {
                item[j] = pwdBin.top[j - 2];
            }
            for (let j = 30; j < enData.length + 30; j++) {
                item[j] = enData[j - 30];
            }
            // 填充剩余的值
            for (let j = enData.length + 30; j < 100; j++) {
                item[j] = Math.floor(Math.random() * 249);
            }
            items[i] = item;
            isWrite = true;
            break;
        }
    }
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if(item[0] == 0) {
            for (let j = 1; j < item.length; j++) {
                if (item[j] == 0) {
                    item[j] = Math.floor(Math.random() * 249);
                }
            }
            items[i] = item;
        }
    }
    if (isWrite) {
        container = items;
        return true;
    }
    throw new Error("账号达到上限");
}
export const dropPriKey = async (password: string) => {
    const items = loadContainer();
    const pwdHash = passwordHash(password);
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item[0] == 1) {
            const oldPwdHash = binToPasswordHash(item.slice(2, 18));
            if (oldPwdHash == pwdHash.top) {
                items[i] = new Uint8Array(100);
            }
        }
    }
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        for (let j = 1; j < item.length; j++) {
            if (item[j] == 0) {
                item[j] = Math.floor(Math.random() * 249);
            }
        }
    }
    return true;
}
export const readPriKey = (password: string) => {
    const items = loadContainer();
    let priKey = '';
    const pwdHash = passwordHash(password);
    for (const item of items) {
        if (item[0] == 0) {
            continue;
        }
        const pwdBin = item.slice(2, 18);
        if (pwdBin.length !== 16) {
            throw new Error('pwd length error');
        }
        const oldPwdHash = binToPasswordHash(pwdBin);
        console.log(oldPwdHash , pwdHash.top)
        if (oldPwdHash === pwdHash.top) {
            const deData = dePriKey(pwdHash.bottom, item.slice(30, item[1] + 30))
            priKey = Buffer.from(deData.slice(0, 32)).toString("hex");
            break;
        }
    }
    if (priKey) {
        return priKey;
    } else {
        throw new Error('账号不存在');
    }
}
export const getAccountTotal = () => {
    let total = 0;
    const items = loadContainer();
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if(item[0] == 1){
            total += 1;
        }
    }
    return total;
}

const KEY = "5714178cd10822e97030b8fdee218833e51abbe5c5623ae771c930e1f2c65a1d";

const password = "123456";

(async()=>{
    console.log(container[0])
    await writePriKey(password, KEY)
    console.log(container[0]);
    const priKey = await readPriKey(password);
    console.log(priKey);
})()