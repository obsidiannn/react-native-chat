import { Button } from "app/components";
import { IconFont } from "app/components/IconFont/IconFont";
import BaseModal from "app/components/base-modal";
import LoadingModal, { LoadingModalType } from "app/components/loading-modal";
import { AuthService } from "app/services/auth.service";
import fileService from "app/services/file.service";
import { ColorsState } from "app/stores/system";
import { pickerImages } from "app/utils/media-util";
import { s } from "app/utils/size";
import toast from "app/utils/toast";
import { Image } from "expo-image";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
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
export default forwardRef((_, ref) => {
    const maxImage: number = 9
    const maxWords: number = 200
    const [images, setImages] = useState<string[]>([])
    const [complains, setComplains] = useState<string>('')

    const [visible, setVisible] = useState<boolean>(false)
    const [userId, setUserId] = useState<number>(0)
    const themeColor = useRecoilValue(ColorsState)
    const loadingModalRef = useRef<LoadingModalType>(null)
    const renderLeftButton = () => {
        return <TouchableOpacity onPress={onClose}>
            <IconFont name="close" color={themeColor.text} />
        </TouchableOpacity>
    }

    useImperativeHandle(ref, () => ({
        open: (paramUserId: number) => {
            if (paramUserId <= 0) { return }
            setVisible(true)
            setUserId(paramUserId)
            setImages([])
        }
    }));

    const onClose = () => {
        setVisible(false)
        setUserId(0)
        setImages([])
        setComplains('')
    }

    const _style = styles({ themeColor })

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
                toast('操作成功')
                onClose()
            }
        } catch (error) {

        } finally {
            loadingModalRef.current?.close()
        }


    }

    return <BaseModal visible={visible} onClose={onClose} renderLeft={renderLeftButton()} styles={{ flex: 1 }}>
        <View style={_style.container}>
            <View style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Text style={_style.title}>Image Evidence (Optional)</Text>
                <Text style={{
                    color: themeColor.secondaryText
                }}>{images.length} / {maxImage}</Text>
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
                        ..._style.imageItem,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: themeColor.secondaryBackground
                    }}>
                    <IconFont name="plus" color={themeColor.secondaryText} />
                </TouchableOpacity>
            </View>
            <View style={{
                borderTopWidth: s(0.5),
                borderTopColor: themeColor.border
            }}>
                <TextInput value={complains}
                    numberOfLines={3}
                    placeholder="Complaints (Optional)"
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
            <Button label="submit" size="large"
                onPress={doSubmit}
                textStyle={{
                    color: themeColor.textChoosed
                }}
                containerStyle={{
                    marginTop: s(24),
                    backgroundColor: themeColor.primary,
                }} />
        </View>
        <LoadingModal ref={loadingModalRef} />
    </BaseModal>
})


const styles = (
    { themeColor }: { themeColor: IColors }
) => StyleSheet.create({
    container: {
        padding: s(12),
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    },
    title: {
        color: themeColor.text,
        fontSize: s(16)
    },
    imageContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginVertical: s(12)
    },
    imageItem: {
        width: s(64), height: s(64),
        marginRight: s(8),
        marginBottom: s(8)
    }
})
