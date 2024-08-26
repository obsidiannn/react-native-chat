import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Modal, Pressable, Text, View, TouchableOpacity } from "react-native";
import { MessageType } from "../chat-ui";
import dateUtil from "app/utils/dateUtil";
import { StyleSheet } from "react-native";
import { $dark, colors } from "app/theme";
import BaseModal from "../base-modal";
import { FlashList } from "@shopify/flash-list";
import { s } from "app/utils/size";
import { Image } from "expo-image";
import fileService from "app/services/file.service";
import { IconFont } from "../IconFont/IconFont";

export interface ImageRecordModalType {
    open: () => void
}
interface ImgRecordType {
    title: string
    data: MessageType.Image[]
}
export default forwardRef((props: {
    images: MessageType.Image[]
}, ref) => {
    // const themeColor = useRecoilValue(ColorsState)
    const themeColor = $dark
    const style = styles({ themeColor })

    const [visible, setVisible] = useState(false)
    const [choosing, setChoosing] = useState<boolean>(false)
    const [choosedIds, setChoosedIds] = useState<string[]>([])
    const pushBullet = (
        list: ImgRecordType[],
        item: MessageType.Image,
        idx: number,
        title: string) => {
        console.log('idx', idx, list.length, title);

        if (list.length - 1 < idx) {
            for (let index = 0; index <= idx; index++) {

                if (index === idx) {
                    console.log(title);

                    list.push({
                        title,
                        data: [item]
                    })
                } else {
                    list.push({
                        title: '',
                        data: []
                    })
                }
            }
        } else {
            list[idx].data.push(item)
        }
    }


    const weekGroups = useMemo(() => {
        const weekGroup: ImgRecordType[] = []
        let idx = 0
        let title = ""
        for (let index = 0; index < props.images.length; index++) {
            const e = props.images[index]
            if (e.type !== 'image') {
                continue
            }
            if (idx === 0) {
                if (dateUtil.inCurrentWeek(e.createdAt ?? 0)) {
                    title = '本周'
                    pushBullet(weekGroup, e, idx, title)
                    continue
                } else {
                    idx += 1
                }
            }
            if (idx === 1) {
                if (dateUtil.inCurrentMonth(e.createdAt ?? 0)) {
                    title = '本月'
                    pushBullet(weekGroup, e, idx, title)
                    continue
                } else {
                    idx += 1
                    title = dateUtil.second2Label(e.createdAt ?? 0, 'YYYY年MM月')
                }
            }
            if (idx > 1) {
                const tempTitle = dateUtil.second2Label(e.createdAt ?? 0, 'YYYY年MM月')
                if (tempTitle === title) {
                    pushBullet(weekGroup, e, idx, title)
                } else {
                    idx += 1
                    title = tempTitle
                    pushBullet(weekGroup, e, idx, title)
                }
            }
        }
        console.log("[weekGroup]", weekGroup);

        return weekGroup
    }, [props.images])


    const onClose = () => {
        setVisible(false)
    }

    useImperativeHandle(ref, () => ({
        open: () => {
            setVisible(true)
        }
    }));



    const renderItem = (item: ImgRecordType, idx: number) => {
        return <View key={item.title + "_" + idx} style={style.itemContainer}>
            <Text style={{
                color: themeColor.text,
                fontSize: s(14)
            }}>{item.title}</Text>
            <View style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                {item.data.map(d => {
                    return <Pressable key={d.id + '_image_preview'}>
                        <Image
                            source={fileService.getFullUrl(d.uri)}
                            style={style.itemImage} />
                        <View style={{
                            position: 'absolute',
                            padding: s(2),
                            borderWidth: s(1),
                            borderColor: themeColor.text,
                            borderRadius: s(24),
                            right: s(10),
                            top: s(10)
                        }}>
                            <IconFont name="checkMark" color={themeColor.text} size={18} />
                        </View>
                    </Pressable>
                })}
            </View>
        </View>
    }

    const renderRightBtn = () => {
        if (choosing) {
            return <TouchableOpacity style={style.rightBtn} onPress={() => {
                setChoosing(!choosing)
            }}>
                <IconFont name="close" color={themeColor.text} size={22} />
            </TouchableOpacity>
        }
        return <TouchableOpacity style={{
            ...style.rightBtn,
            backgroundColor: colors.palette.gray600
        }} onPress={() => {
            setChoosing(!choosing)
        }}>
            <IconFont name="checkMark" color={themeColor.text} size={22} />
        </TouchableOpacity>
    }

    return <BaseModal visible={visible} styles={style.container} onClose={onClose} title="图片"
        renderRight={renderRightBtn()}
    >
        <View style={{ flex: 1 }}>
            <FlashList data={weekGroups} renderItem={({ item, index }) => renderItem(item, index)}
                estimatedItemSize={30}
            />
        </View>
    </BaseModal>
})


const styles = ({ themeColor }: {
    themeColor: IColors
}) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themeColor.background
    },
    rightBtn: {
        backgroundColor: themeColor.primary,
        padding: s(4),
        borderRadius: s(8)
    },
    itemContainer: {
        paddingHorizontal: s(12)
    },
    itemImage: {
        width: s(84),
        height: s(84),
        marginTop: s(8),
        marginRight: s(8)
    }
})