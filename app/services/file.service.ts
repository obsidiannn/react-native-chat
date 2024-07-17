
import * as ImagePicker from 'expo-image-picker';
import { requestCameraPermission, requestDirectoryPermission, requestPhotoPermission } from './permissions';
import s3Api from './api/sys/s3';

import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import * as FileSystem from 'expo-file-system';
import mime from 'mime/dist/src/index_lite';
import { globalStorage } from '@/lib/storage';
import quickAes from 'app/utils/quick-aes';
import crypto from 'react-native-quick-crypto';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';
import * as RNFS from '@dr.pogodin/react-native-fs';
import { SaveFormat, manipulateAsync } from 'expo-image-manipulator';
import { ISystemS3GetPreSignUrlResponse } from 'types/api';

// 加解密的分片大小
const ENCODE_CHUNK = 65536
const DECODE_CHUNK = ENCODE_CHUNK + 16

export interface ChooseImageOption {
    aspect?: [number, number],
    quality: number,
}

export interface EncodeFileResult {
    path: string
    md5: string
    enc_md5: string
}

export const chooseMultipleImage = async (isCamera: boolean, option: ChooseImageOption, multiple: boolean = true, isEdit: boolean = false): Promise<string[] | null> => {
    if (multiple) {
        isEdit = false;
    }
    const params = {
        ...option,
        allowsEditing: isEdit,
        exif: false,
        chooseMultipleImage: multiple,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
    }
    if (!isCamera) {
        await requestPhotoPermission()
        const result = await ImagePicker.launchImageLibraryAsync(params);
        if (!result.canceled) {
            return result.assets.map(item => item.uri)
        }
        return null;
    }
    await requestCameraPermission();
    const result = await ImagePicker.launchCameraAsync(params);
    if (!result.canceled) {
        return result.assets.map(item => item.uri)
    }
    return null;
}

const isExist = async (path: string): Promise<boolean> => {
    const info = await FileSystem.getInfoAsync(path)
    return info.exists
}

export const chooseImage = async (isCamera: boolean, option: ChooseImageOption): Promise<string | null> => {
    const images = await chooseMultipleImage(isCamera, option, false, true);
    if (images && images.length > 0) {
        return images[0];
    }
    return null;
}

export const uploadFile = async (uri: string): Promise<{
    uploadUrl: string;
    key: string;
}> => {

    const mimeType = mime.getType(uri) ?? 'application/octet-stream';

    return new Promise(async (resolve, reject) => {
        const rep = await s3Api.getUploadPreSignUrl()
        try {
            const response = await FileSystem.uploadAsync(rep.uploadUrl, uri, {
                httpMethod: 'PUT',
                uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
                headers: {
                    ContentType: mimeType ?? ''
                }
            });
            console.log("response", response)
            if (!response) {
                reject(new Error('上傳失敗'));
            }
            response?.status === 200 ? resolve(rep) : reject(new Error('上傳失敗'));
        } catch (error) {
            reject(error)
        }
    })

};

/**
 * 上傳本地圖片，不加密
 * @param localImage 
 * @returns 
 */
export const uploadImage = async (localImage: string) => {
    if (localImage.startsWith('file:/')) {
        const manipResult = await manipulateAsync(
            localImage,
            [
                { resize: { width: 200 } },
            ],
            { compress: 1, format: SaveFormat.JPEG }
        );
        const webpOutput = manipResult.uri.replace(/\.jpg$/, '.webp');
        if (await format(manipResult.uri, webpOutput)) {
            FileSystem.deleteAsync(localImage);
            localImage = webpOutput;
        }

        const result = await uploadFile(localImage);
        console.log("result:", result);
        return result.key;
    }
    return null
}

export const format = async (input: string, output: string): Promise<boolean> => {
    const cmd = `-i ${input} ${output}`;
    const session = await FFmpegKit.execute(cmd);
    const returnCode = await session.getReturnCode();
    if (ReturnCode.isSuccess(returnCode)) {
        return true;
    } else if (ReturnCode.isCancel(returnCode)) {
        throw new Error('轉碼取消');
    } else {
        throw new Error('轉碼失敗');
    }
}

/**
 * 視頻的轉碼
 * @param input 
 * @param output 
 * @returns 
 */
export const formatVideo = async (input: string, output: string): Promise<boolean> => {
    const cmd = `-i ${input} -c:v libx264 ${output}`;
    const session = await FFmpegKit.execute(cmd);
    const returnCode = await session.getReturnCode();
    if (ReturnCode.isSuccess(returnCode)) {
        return true;
    } else if (ReturnCode.isCancel(returnCode)) {
        throw new Error('轉碼取消');
    } else {
        console.log(cmd);
        throw new Error('轉碼失敗');
    }
}

let baseUrl: string | undefined;

const getFullUrl = (key: string) => {
    if (key.startsWith('http') || key.startsWith('https')) {
        return key
    }
    if (key.startsWith('data:')) {
        return key
    }
    if (key.startsWith('file://')) {
        return key
    }
    if (!baseUrl) {
        // baseUrl = getStaticUrl();
    }
    const url = `${baseUrl}/${key}`
    console.log('[url]', url);

    return url;
}
const encryptFile = async (path: string, key: string): Promise<{
    path: string;
    enc_md5: string;
    md5: string;
}> => {
    const content = Buffer.from(await FileSystem.readAsStringAsync(path, {
        encoding: FileSystem.EncodingType.Base64,
    }), 'base64');
    const md5 = crypto.Hash('md5').update(content).digest('hex');
    const newPath = `${FileSystem.cacheDirectory}${crypto.randomUUID()}.enc`;
    const encData = await quickAes.EnBuffer(content, key);
    await FileSystem.writeAsStringAsync(newPath, Buffer.from(encData).toString('base64'), {
        encoding: FileSystem.EncodingType.Base64,
    });
    const encMd5 = crypto.Hash('md5').update(encData).digest('hex');
    return {
        path: newPath,
        enc_md5: encMd5,
        md5: md5,
    };
}

const encryptVideo = async (path: string, key: string): Promise<{
    path: string;
    enc_md5: string;
    md5: string;
}> => {
    const content = Buffer.from(await FileSystem.readAsStringAsync(path, {
        encoding: FileSystem.EncodingType.Base64,
    }), 'base64');
    const newPath = `${FileSystem.cacheDirectory}${crypto.randomUUID()}.enc`;
    const encData = await quickAes.En(content.toString('base64'), key);
    const md5 = crypto.Hash('md5').update(content).digest('hex');
    await FileSystem.writeAsStringAsync(newPath, encData, {
    });
    const encMd5 = crypto.Hash('md5').update(encData).digest('hex');
    return {
        path: newPath,
        enc_md5: encMd5,
        md5: md5,
    };
}

// 判斷下載的文件是否存在
const checkDownloadFileExists = async (url: string) => {
    const key = crypto.Hash('sha256').update(url).digest('hex');
    const path = `${FileSystem.cacheDirectory}/${key}`;
    return await isExist(path);
}

const checkExist = async (path: string): Promise<boolean> => {
    return await isExist(path);
}

const urlToPath = (url: string) => {
    const key = crypto.Hash('sha256').update(url).digest('hex');
    return `${FileSystem.cacheDirectory}/${key}`;
}

const downloadFile = async (url: string, path: string = ''): Promise<string> => {
    if (!path) {
        const key = crypto.Hash('sha256').update(url).digest('hex');
        path = `${FileSystem.cacheDirectory}/${key}`;
    }
    // 判斷文件是否存在
    if (await isExist(path)) {
        console.log('文件已存在', path);
        return path;
    }
    const result = await FileSystem.downloadAsync(url, path, {
        md5: true,
    });

    console.log('download result', result)
    if (result.status !== 200) {
        // 刪除文件
        await FileSystem.deleteAsync(path)
        throw new Error('下載失敗');
    }
    return path;
}

const readFile = async (path: string): Promise<string> => {
    return await FileSystem.readAsStringAsync(path, {
        encoding: FileSystem.EncodingType.Base64,
    });
}
const getEnFileContent = async (uri: string, encKey: string): Promise<string | null> => {
    if (!uri.startsWith('upload')) {
        throw new Error('不支持的文件');
    }
    const path = await downloadFile(await getFullUrl(uri));
    const encData = await readFile(path);
    const decData = quickAes.DeBuffer(Buffer.from(encData, 'base64'), encKey);
    return Buffer.from(decData).toString('base64');
}

/**
 * 生成視頻縮略圖
 * @param videoPath 視頻地址
 * @param mid 消息主鍵
 * @returns 
 */
const generateVideoThumbnail = async (videoPath: string, mid: string) => {
    const thumbnailPath = FileSystem.cacheDirectory + mid + '_thumbnail.jpg'
    const cmd = `-i ${videoPath} -ss 00:00:01 -vframes 1 ${thumbnailPath}`
    const session = await FFmpegKit.execute(cmd)
    if (ReturnCode.isSuccess(await session.getReturnCode())) {
        return thumbnailPath;
    }
    return null
}

const cachePath = () => {
    return FileSystem.cacheDirectory
}

/**
 * 解密視頻文件
 * @param uri 雲端文件位置
 * @param encKey 
 * @returns 
 */
const decodeVideo = async (uri: string, encKey: string): Promise<string | null> => {
    const name = getFileNameSign(uri)
    const targetPath = `${FileSystem.cacheDirectory}/${name}_decode.mp4`;
    const encodeFilePath = await downloadFile(getFullUrl(uri));

    const decodeFilePath = fileSplitDecode(targetPath, encodeFilePath, encKey)
    if (decodeFilePath !== null) {
        return decodeFilePath
    }
    return null
}

/**
 * 文件分片加密
 * @param encKey 
 * @param fileKey 文件在雲端的路徑
 * @param localPath 待加密的本地文件地址
 * @returns 
 */
const fileSpliteEncode = async (fileKey: string, localPath: string, encKey: string): Promise<EncodeFileResult> => {
    const fileKeySign = getFileNameSign(fileKey)
    const fileInfo = await getFileInfo(localPath)
    const newPath = `${FileSystem.cacheDirectory}${fileKeySign}.enc`;

    if (!await isExist(newPath)) {
        const limit = ENCODE_CHUNK
        const total = fileInfo.size
        for (let start = 0; start < total; start += limit) {
            const end = Math.min(start + limit - 1, total - 1)
            const originalData = await chunkFromFile(localPath, start, end)
            const decData = quickAes.EnPadding(Buffer.from(originalData, 'base64'), encKey);
            await RNFS.appendFile(newPath, Buffer.from(decData).toString('base64'), 'base64')
            // await FileSystem.writeAsStringAsync(newPath, Buffer.from(decData).toString('base64'),{
            //     encoding: 'utf8'
            // });
        }
    }

    const targetInfo = await FileSystem.getInfoAsync(newPath, { size: true, md5: true })
    return {
        path: newPath,
        enc_md5: targetInfo.md5 ?? '',
        md5: fileInfo.md5,
    };
}

/**
 * 文件分片解密
 * @param encKey 
 * @param localPath 本地密文文件地址
 * @param targetPath 解密後的文件地址
 * @returns 
 */
const fileSplitDecode = async (targetPath: string, localPath: string, encKey: string): Promise<string | null> => {
    const exists = await RNFS.exists(targetPath);
    if (exists) {
        // return targetPath
        await RNFS.unlink(targetPath)
    }
    const encodeFile = await FileSystem.getInfoAsync(localPath, { size: true, md5: true })
    const total = encodeFile.size
    const limit = DECODE_CHUNK
    for (let start = 0; start < total; start += limit) {
        const end = Math.min(start + limit - 1, total - 1)
        const encData = await chunkFromFile(localPath, start, end)
        const decData = quickAes.DePadding(Buffer.from(encData, 'base64'), encKey);

        await RNFS.appendFile(targetPath, Buffer.from(decData).toString('base64'), 'base64')
    }
    return targetPath
}

/**
 * 分片讀取文件
 * @param filePath 文件地址
 * @param start 字符下標起點
 * @param end 字符下標終點
 * @returns 
 */
const chunkFromFile = async (filePath: string, start: number, end: number) => {
    const chunk = await RNFS.read(filePath, end - start + 1, start, {
        encoding: 'base64'
    })
    return chunk
}


const getFileNameSign = (key: string) => {
    return crypto.Hash('sha256').update(key).digest('hex');
}

// 保存到相冊
const saveToAlbum = async (uri: string, extType = ''): Promise<boolean> => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
        return false;
    }
    try {
        if (uri.startsWith('data')) {
            // 獲取文件類型
            const mimeType = uri.split(';')[0].split(':')[1];
            // 獲取文件後綴
            // 生成文件名 保存在緩存目錄
            const data = uri.split(',')[1];
            uri = `${FileSystem.cacheDirectory}${crypto.randomUUID()}.${mime.getExtension(mimeType)}`;
            await FileSystem.writeAsStringAsync(uri, data, {
                encoding: FileSystem.EncodingType.Base64,
            });
        }
        if (!uri.startsWith('file')) {
            return false
        }

        const ext = extType === '' ? mime.getExtension(mime.getType(uri) ?? '') : extType;
        console.log('ext=', ext);
        if (ext == 'webp') {
            const output = uri.replace(`.${ext}`, '.jpg');
            await format(uri, output);
            uri = output;
        } else {
            if (uri.indexOf('.' + ext) === -1) {
                const localPath = uri + '.' + ext
                await FileSystem.copyAsync({
                    from: uri,
                    to: localPath
                })
                uri = localPath
            }
        }
        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync('BoboChat', asset, false)
        return true;
    } catch (error: any) {
        console.log('saveToAlbum error', error);
    }
    return false
}
const saveFile = async (data: string, name: string): Promise<string | null> => {
    if (data.startsWith('data')) {
        data = data.split(',')[1];
    }
    if (Platform.OS === 'android') {
        // 保存到相冊
        const dir = await requestDirectoryPermission();
        if (!dir) {
            return null;
        }
        // 生成文件名 保存在緩存目錄
        let path = `${dir}/${name}`;
        // 判斷文件是否存在
        const exists = await RNFS.exists(path);
        if (exists) {
            console.log('文件已存在');
            // 在原來的文件名的基礎上加上時間戳
            const time = new Date().getTime();
            const ext = path.split('.').pop();
            name = name.replace(`.${ext}`, `_${time}.${ext}`);
            path = `${dir}/${name}`;
        }
        await RNFS.writeFile(path, data, {
            encoding: 'base64',
        });
        return path;
    } else {
        let path = `${FileSystem.cacheDirectory}${name}`;
        const exists = await FileSystem.getInfoAsync(path);
        if (exists.exists) {
            const time = new Date().getTime();
            const ext = path.split('.').pop();
            path = path.replace(`.${ext}`, `_${time}.${ext}`);
        }
        await FileSystem.writeAsStringAsync(path, data, {
            encoding: FileSystem.EncodingType.Base64,
        });
        return path;
    }
}
const getFileInfo = async (path: string) => {
    return await FileSystem.getInfoAsync(path, {
        size: true,
        md5: true,
    });
}
export default {
    chooseImage,
    uploadFile,
    getFullUrl,
    encryptFile,
    downloadFile,
    readFile,
    getEnFileContent,
    saveToAlbum,
    saveFile,
    getFileInfo,
    checkDownloadFileExists,
    decodeVideo,
    urlToPath,
    getFileNameSign,
    generateVideoThumbnail,
    cachePath,
    encryptVideo,
    checkExist,
    fileSplitDecode,
    fileSpliteEncode,
    uploadImage
}
