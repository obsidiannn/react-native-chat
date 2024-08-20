import { StackScreenProps } from "@react-navigation/stack";
import Navbar from "app/components/Navbar";
import { ColorsState } from "app/stores/system";
import { s } from "app/utils/size";
import { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { View } from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import { useRecoilValue } from "recoil";
import { App } from "types/app";
import { SysCategoryItem } from "@repo/types";
import { IconFont } from "app/components/IconFont/IconFont";
import SystemCategoryModal, { SystemCategoryModalType } from "./SystemCategoryModal";
import app from "app/api/sys/app";
import { IModel } from "@repo/enums";
import LoadingModal, { LoadingModalType } from "app/components/loading-modal";
import fileService from "app/services/file.service";
import { AuthService } from "app/services/auth.service";
import toast from "app/utils/toast";
import { pickerImages } from "app/utils/media-util";
import { Image } from "expo-image";
import { Button } from "app/components";
type Props = StackScreenProps<App.StackParamList, 'SystemFeedbackScreen'>;
export const SystemFeedbackScreen = (props: Props) => {

    const [category, setCategory] = useState<SysCategoryItem | null>(null)
    const [categories, setCategories] = useState<SysCategoryItem[]>([])
    const [content, setContent] = useState<string>('')
    const themeColor = useRecoilValue(ColorsState)
    const systemCategoryModalRef = useRef<SystemCategoryModalType>(null)
    const [images, setImages] = useState<string[]>([])
    const loadingModalRef = useRef<LoadingModalType>(null)
    const style = styles({ themeColor })

    const doSubmit = async () => {
        if (!category) {
            toast('请选择分类')
            return
        }
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
            const id = await AuthService.doFeedback(category.id, urls, content)
            if (id) {
                toast('操作成功')
            }
        } catch (error) {

        } finally {
            loadingModalRef.current?.close()
        }

    }
    useEffect(() => {
        app.getCategories({
            type: IModel.ISystem.CategoryType.FEEDBACK
        }).then(res => {
            setCategories(res.list)
        })
    }, [])

    return <View style={{
        flex: 1, backgroundColor: themeColor.secondaryBackground,
    }}>
        <Navbar title="意见反馈" />
        <View style={{
            flex: 1,
            paddingVertical: s(12)
        }}>
            <View style={style.categoryLine}>
                <Text style={{
                    fontSize: s(16), color: themeColor.text
                }}>
                    所属分类
                    <Text style={{
                        fontSize: s(12), color: themeColor.secondaryText
                    }}>(必填)
                    </Text>
                </Text>
                <TouchableOpacity style={{
                    display: 'flex', flexDirection: 'row', alignItems: 'center'
                }} onPress={() => {
                    systemCategoryModalRef.current?.open()
                }}>
                    <Text>
                        {
                            category === null ? '请选择分类' : category.name
                        }
                    </Text>
                    <IconFont name="arrowRight" color={themeColor.secondaryText} size={16} />
                </TouchableOpacity>
            </View>
            <View style={{ marginTop: s(12), backgroundColor: themeColor.background, padding: s(12) }}>
                <TextInput
                    value={content}
                    placeholder="请输入"
                    numberOfLines={3}
                    textAlignVertical="top"
                    onChangeText={(v) => {
                        setContent(v)
                    }}
                />
            </View>

            <View style={style.imageContainer}>
                {
                    images.map((i, idx) => {
                        return <Image source={fileService.getFullUrl(i)}
                            key={'img_' + idx}
                            style={style.imageItem} />
                    })
                }
                <TouchableOpacity
                    onPress={() => {
                        // captureImage()
                        pickerImages(9).then(res => {
                            setImages(res.map(r => r.uri))
                        })
                    }}
                    style={{
                        ...style.imageItem,
                        borderRadius: s(8),
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: themeColor.border,
                    }}>
                    <IconFont name="plus" color={themeColor.secondaryText} />
                </TouchableOpacity>
            </View>
            <Button label="提交反馈" size="large"
                onPress={doSubmit}
                containerStyle={{
                    backgroundColor: themeColor.primary,
                    marginHorizontal: s(12), bottom: 0
                }} />
        </View>
        <SystemCategoryModal
            ref={systemCategoryModalRef}
            onChoose={(item: SysCategoryItem) => { setCategory(item) }}
            list={categories} />
        <LoadingModal ref={loadingModalRef} />
    </View>
}


const styles = (
    { themeColor }: { themeColor: IColors }
) => StyleSheet.create({
    container: {
        padding: s(8),
        display: 'flex',
        flexDirection: 'column',
        flex: 1
    },
    categoryLine: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: themeColor.background,
        padding: s(12)
    },
    imageContainer: {
        display: 'flex',
        flexDirection: 'row',
        paddingHorizontal: s(12),
        flexWrap: 'wrap',
        marginVertical: s(12), flex: 1
    },
    imageItem: {
        width: s(64), height: s(64),
        marginRight: s(8),
        marginBottom: s(8)
    }
})
