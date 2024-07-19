import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { ActivityIndicator, View, Platform, StatusBar, Text } from "react-native";
import mime from 'mime/dist/src/index_lite';
import * as Sharing from 'expo-sharing';
import BaseModal from "./base-modal";
import { MessageType } from "./chat-ui";
import { colors } from "app/theme";
import { bytesToSize, scale } from "app/utils/size";
import toast from "app/utils/toast";
import { Image } from "expo-image";
import { Button } from "./Button";
import fileService from "app/services/file.service";
import { useTranslation } from "react-i18next";

export interface ChatUIFileModalRef {
    open: (params: {
        encKey: string;
        file: MessageType.File;
    }) => void;
}
export default forwardRef((_, ref) => {
    const [visible, setVisible] = useState(false);
    const [encKey, setEncKey] = useState("");
    const [file, setFile] = useState<MessageType.File>();
    const [localPath, setLocalPath] = useState('')
    const [loading, setLoading] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    const {t} = useTranslation('screens')
    const downloadFile = useCallback(async (f: MessageType.File) => {
        const uri = f.uri
        const _localPath = await fileService.downloadFile(fileService.getFullUrl(uri));
        toast('下載成功');
        setLocalPath(_localPath)
        setDownloaded(true);
    }, []);
    const saveFile = useCallback(async (f: MessageType.File) => {
        if (typeof f.uri == 'string') {
            // if (f.path.startsWith('http')) {
            //     return;
            // }
            // if (f.path.startsWith('file://')) {
            //     return;
            // }
        }
        // const path = await fileService.saveFile(f.uri, f.name);
        // if (!path) {
        //     toast('保存失敗1');
        //     return;
        // }
        if (Platform.OS == 'ios') {
            Sharing.shareAsync(localPath, {
                mimeType: mime.getType(localPath) ?? 'application/octet-stream',
            });
            return;
        } else {
            Sharing.shareAsync(localPath, {
                mimeType: mime.getType(localPath) ?? 'application/octet-stream',
            });
        }
    }, [])
    useImperativeHandle(ref, () => ({
        open: (params: {
            encKey: string
            file: MessageType.File;
        }) => {
            (async () => {
                console.log('file is ', params.file);
                if (await fileService.checkDownloadFileExists(fileService.getFullUrl(params.file.uri))) {
                    const tempPath = fileService.urlToPath(fileService.getFullUrl(params.file.uri))
                    setDownloaded(true)
                    setLocalPath(tempPath)
                }
                setEncKey(params.encKey);
                setFile(params.file);
                setVisible(true);
            })()

        }
    }));

    const onClose = () => {
        setVisible(false)
    }
    return <BaseModal visible={visible} onClose={onClose} title={t('chat.videoDetail')}>
        <View style={{
            flex: 1,
            alignItems: 'center',
            paddingHorizontal: scale(25),
        }}>
            <Image source={require('assets/icons/file-unknown.svg')} style={{
                width: scale(60),
                height: scale(60),
                marginTop: scale(72),
            }} />
            <Text style={{
                fontSize: scale(16),
                color: '#333',
                fontWeight: '600',
                marginTop: scale(8),
            }}>{file?.name}</Text>
            <Text style={{
                fontSize: scale(14),
                color: '#999',
                fontWeight: '400',
                marginTop: scale(10),
            }}>文件大小：{bytesToSize(file?.size ?? 0)}</Text>
            <Button disabled={loading} onPress={() => {
                if (loading) {
                    return;
                }
                if (!file) {
                    return;
                }
                setLoading(true);
                if (downloaded) {
                    saveFile(file).finally(() => {
                        setLoading(false);
                    });
                } else {
                    downloadFile(file).finally(() => {
                        setLoading(false);
                    });
                }

            }} style={{
                marginTop: scale(239),
                height: scale(50),
                borderRadius: scale(16),
                display: 'flex',
                width: '100%',
                backgroundColor: colors.palette.primary
            }} text={
                downloaded ? (loading ? '解密中' : '分享') : (loading ? '下載中' : '保存到本地')
            }>
                {loading ? <ActivityIndicator color="white" style={{
                    marginRight: scale(5),
                }} animating={loading} /> : null}
            </Button>
        </View>
    </BaseModal>
});