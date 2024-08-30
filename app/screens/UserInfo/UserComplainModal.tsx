import { Button } from "app/components";
import { IconFont } from "app/components/IconFont/IconFont";
import { ScreenModal, ScreenModalType } from "app/components/ScreenModal";
import LoadingModal, { LoadingModalType } from "app/components/loading-modal";
import { AuthService } from "app/services/auth.service";
import fileService from "app/services/file.service";
import { ColorsState } from "app/stores/system";
import { pickerImages } from "app/utils/media-util";
import { s } from "app/utils/size";
import toast from "app/utils/toast";
import { Image } from "expo-image";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { View, Text, TouchableOpacity } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { useRecoilValue } from "recoil";

export interface ComplainModalType {
    open: (userId: number) => void
    onSubmit: () => Promise<void>
}
/**
 * 用户投诉
 */
export default forwardRef((props:{
    theme: 'light' | 'dark'
}, ref) => {
    const maxImage: number = 9
    const maxWords: number = 200
    const [images, setImages] = useState<string[]>([])
    const [complains, setComplains] = useState<string>('')

    const [userId, setUserId] = useState<number>(0)
    const themeColor = useRecoilValue(ColorsState)
    const loadingModalRef = useRef<LoadingModalType>(null)
    useImperativeHandle(ref, () => ({
        open: (paramUserId: number) => {
            if (paramUserId <= 0) { return }
            setUserId(paramUserId)
            setImages([])
            screenModalRef.current?.open()
        }
    }));

    const onClose = () => {
        screenModalRef.current?.close()
        setUserId(0)
        setImages([])
        setComplains('')
    }

    const _style = styles({ themeColor })
    const { t } = useTranslation('default')
    const doSubmit = async () => {
        loadingModalRef.current?.open()
        try {
            let urls: string[] = []
            if (images.length > 0) {
                for (let index = 0; index < images.length; index++) {
                    const i = images[index];
                    if (i.startsWith("file://")) {
                        const u = await fileService.uploadImage(i)
                        if (u) {
                            urls.push(u)
                        }
                    } else if (i.startsWith('http') || i.startsWith('tmp/')) {
                        urls.push(i)
                    }
                }
                console.log('urls', urls);

                setImages(urls)
            }
            const id = await AuthService.doComplain(urls, userId, complains)
            if (id) {
                toast(t('Complain success'))
                onClose()
            }
        } catch (error) {

        } finally {
            loadingModalRef.current?.close()
        }


    }
    const screenModalRef = useRef<ScreenModalType>(null)
    
    return <ScreenModal theme={props.theme} ref={screenModalRef}>
        <View style={_style.container}>

            <View style={{
            }}>
                <TextInput value={complains}
                    numberOfLines={3}
                    textAlignVertical="top"
                    placeholder={t('Reason')}
                    maxLength={maxWords}
                    placeholderTextColor={themeColor.secondaryText}
                    style={{
                        color: themeColor.text,
                        backgroundColor: themeColor.background
                    }}
                    onChangeText={(v) => {
                        setComplains(v)
                    }} />
                <Text style={{
                    textAlign: 'right',
                    color: themeColor.secondaryText
                }}>
                    {complains.length} / {maxWords}
                </Text>
            </View>
            <View style={_style.imageContainer}>
                {
                    images.map((i, idx) => {
                        return <Image source={fileService.getFullUrl(i)}
                            key={'img_' + idx}
                            style={_style.imageItem} />
                    })
                }
                <TouchableOpacity
                    onPress={() => {
                        // captureImage()
                        pickerImages(maxImage).then(res => {
                            setImages(res.map(r => r.uri))
                        })
                    }}
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: themeColor.secondaryBackground,
                        width: s(84),
                        height: s(84),
                        borderRadius: s(12)
                    }}>
                    <IconFont name="plus" color={themeColor.secondaryText} />
                    <Text style={{
                        color: themeColor.secondaryText
                    }}>{t('Photo')} ({images.length}/{maxImage})</Text>
                </TouchableOpacity>
            </View>

            <Button fullRounded fullWidth label={t('Submit')} size="large"
                onPress={doSubmit}
                textStyle={{
                    color: themeColor.textChoosed
                }}
                containerStyle={{
                    marginVertical: s(24),
                    backgroundColor: themeColor.primary,
                }} />
        </View>

        <LoadingModal theme={props.theme} ref={loadingModalRef} />
    </ScreenModal>
})


const styles = (
    { themeColor }: { themeColor: IColors }
) => StyleSheet.create({
    container: {
        padding: s(12),
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        marginTop: s(32),
        backgroundColor: themeColor.background,
        borderTopLeftRadius: s(24),
        borderTopRightRadius: s(24),
    },
    title: {
        color: themeColor.text,
        fontSize: s(16)
    },
    imageContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginVertical: s(24)
    },
    imageItem: {
        width: s(64), height: s(64),
        marginRight: s(8),
        marginBottom: s(8)
    }
})
