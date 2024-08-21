/**
 * 收藏夹
 * @returns 
 */

import { StackScreenProps } from "@react-navigation/stack";
import Navbar from "app/components/Navbar";
import { ColorsState } from "app/stores/system";
import { FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRecoilValue } from "recoil";
import { App } from "types/app";
import { SearchInput } from "./SearchInput";
import { s } from "app/utils/size";
import { Text } from "react-native";
import { MessageType } from "app/components/chat-ui";
import { useEffect, useRef, useState } from "react";
import { LocalCollectService } from "app/services/LocalCollectService";
import collectMapper from "app/utils/collect.mapper";
import CollectTextMsg from "./components/TextMsg";
import CollectImageMsg from "./components/ImageMsg";
import CollectVideoMsg from "./components/VideoMsg";
import CollectFileMsg from "./components/FileMsg";
import CollectRecords from "./components/Records";
import RecordDetailModal, { RecordDetailModalType } from "./record/RecordDetailModal";
import { LocalCollectDetailService } from "app/services/LocalCollectDetailService";

export interface CollectItem {
    id: number,
    fromAuthorId: number,
    fromAuthor: string,
    chatId: string
    msgId: string
    type: MessageType.Any['type'] | 'record'
    readCount: number
    title: string
    data: MessageType.PartialAny | CollectRecord[] | null
    createdAt: string
}
export interface CollectRecord {
    name: string
    title: string
}


type Props = StackScreenProps<App.StackParamList, 'CollectScreen'>;
export const CollectScreen = (props: Props) => {

    const insets = useSafeAreaInsets();
    const themeState = useRecoilValue(ColorsState);
    const style = styles({ themeState })

    const [data, setData] = useState<CollectItem[]>([])
    const [page, setPage] = useState<number>(1)
    const [chooseIdx, setChooseIdx] = useState<number>(-1)
    const [keyword, setKeyword] = useState<string | null>(null)
    const recordDetailModalRef = useRef<RecordDetailModalType>(null)
    const loadData = (
        _page: number,
        choosed: number,
        reset: boolean = false,
        _keyword: string = '') => {
        // LocalCollectService.removeAll()
        const searchType: MessageType.Any['type'][] = findSearchType(choosed)
        LocalCollectService.queryPage({
            page: _page, size: 10,
            keyword: _keyword === '' ? keyword : _keyword,
            desc: true,
            type: searchType
        }).then(res => {
            if (!reset) {
                if (res.length > 0) {
                    const collects = res.map(r => collectMapper.convertItem(r))
                    setData(items => {
                        const ids = items.map(c => c.id)
                        return items.concat(collects.filter(c => !ids.includes(c.id)))
                    })
                    setPage(_page)
                }
            } else {
                const collects = res.map(r => collectMapper.convertItem(r))
                setData(collects)
                setPage(_page)
            }

        })
    }



    const renderItem = (item: CollectItem) => {
        switch (item.type) {
            case "text":
                return <CollectTextMsg item={item} themeState={themeState} />
            case "image":
                return <CollectImageMsg item={item} themeState={themeState} />
            case "video":
                return <CollectVideoMsg item={item} themeState={themeState} />
            case "file":
                return <CollectFileMsg item={item} themeState={themeState} />
            case "record":
                return <CollectRecords item={item} themeState={themeState} onPress={() => {
                    LocalCollectDetailService.findByCollectId(item.id).then(res => {
                        if (res.length > 0) {
                            recordDetailModalRef.current?.open(res.map(r => {
                                const t = JSON.parse(r.data) as MessageType.Any
                                console.log('t', t);
                                return t

                            }))
                        }
                    })
                }} />
        }
        return <></>
    }


    const findSearchType = (idx: number): MessageType.Any['type'][] => {
        switch (idx) {
            case 1:
                return []
            case 2:
                return []
            case 3:
                return ['video', 'image']
            case 4:
                return []
            case 5:
                return ['file']
        }

        return []
    }

    const changeType = (idx: number) => {
        if (chooseIdx === idx) {
            setChooseIdx(-1)
            loadData(1, -1, true)
        } else {
            setChooseIdx(idx)
            loadData(1, idx, true)
        }
    }

    useEffect(() => {
        loadData(page, chooseIdx)
    }, [])

    const choosedStyle = (idx: number) => {
        if (idx === chooseIdx) {
            return {
                backgroundColor: themeState.background,
                color: themeState.text
            }
        }
        return {
            color: themeState.text
        }
    }

    return <View style={{
        flex: 1,
        paddingTop: insets.top,
        backgroundColor: themeState.secondaryBackground,
    }}>
        <Navbar title="收藏夹" />

        <View style={style.container}>
            <SearchInput color={themeState} onSearch={async (v) => {
                setKeyword(v)
                loadData(1, chooseIdx, true, v)
            }} />
            <View style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center',
            }}>
                <TouchableOpacity style={style.headerButton} onPress={() => { changeType(1) }}>
                    <Text style={{
                        ...style.typeButton,
                        ...choosedStyle(1)
                    }}>最近使用</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{
                    ...style.typeButton,
                    ...choosedStyle(2)
                }} onPress={() => { changeType(2) }}>
                    <Text style={{ color: themeState.primary }}>链接</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{
                    ...style.typeButton,
                    ...choosedStyle(3)
                }} onPress={() => { changeType(3) }}>
                    <Text style={{ color: themeState.primary }}>图片与视频</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{
                    ...style.typeButton,
                    ...choosedStyle(4)
                }} onPress={() => { changeType(4) }}>
                    <Text style={{ color: themeState.primary }}>语音</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{
                    ...style.typeButton,
                    ...choosedStyle(5)
                }} onPress={() => { changeType(5) }}>
                    <Text style={{ color: themeState.primary }}>文件</Text>
                </TouchableOpacity>
            </View>

            <View style={{
                flex: 1,
            }}>
                <FlatList
                    data={data}
                    onEndReached={() => {
                        console.log('end reached');
                        loadData(page + 1, chooseIdx)
                    }}
                    showsVerticalScrollIndicator
                    // estimatedItemSize={300}
                    renderItem={({ item, index }) => renderItem(item)}
                    keyExtractor={(item) => item.id + ''}
                />

            </View>
        </View>
        <RecordDetailModal ref={recordDetailModalRef} />
    </View >
}

const styles = (
    { themeState }: { themeState: IColors }
) => StyleSheet.create({
    container: {
        padding: s(8),
        display: 'flex',
        flexDirection: 'column',
        flex: 1
    },
    headerButton: {
        padding: s(12),

    },
    item: {
        backgroundColor: themeState.background,
        borderRadius: s(8),
        marginHorizontal: s(4),
        marginTop: s(12),
        display: 'flex',
        flexDirection: 'column',
        padding: s(12)
    },
    typeButton: {
        color: themeState.primary,
        padding: s(8),
        borderRadius: s(4),
    }
})
