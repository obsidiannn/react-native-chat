/**
 * 收藏夹
 * @returns 
 */

import { StackScreenProps } from "@react-navigation/stack";
import Navbar from "app/components/Navbar";
import { ColorsState } from "app/stores/system";
import { StyleSheet, TouchableOpacity } from "react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRecoilValue } from "recoil";
import { App } from "types/app";
import { SearchInput } from "./SearchInput";
import { s } from "app/utils/size";
import { Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { MessageType } from "app/components/chat-ui";
import { useState } from "react";
import { LocalCollectService } from "app/services/LocalCollectService";
import collectMapper from "app/utils/collect.mapper";

export interface CollectItem {
    id: number,
    fromAuthorId: number,
    fromAuthor: string,
    chatId: string
    msgId: string
    type: string
    readCount: number
    title: string
    data: MessageType.PartialAny | null
    createdAt: string
}


type Props = StackScreenProps<App.StackParamList, 'CollectScreen'>;
export const CollectScreen = (props: Props) => {

    const insets = useSafeAreaInsets();
    const themeState = useRecoilValue(ColorsState);
    const style = styles({ themeState })

    const [data, setData] = useState<CollectItem[]>([])
    const [page, setPage] = useState<number>(1)
    const [keyword, setKeyword] = useState<string | null>(null)
    const loadData = (_page: number) => {
        LocalCollectService.queryPage({
            page: _page, size: 10, keyword
        }).then(res => {
            if (res.length > 0) {
                const collects = res.map(r => collectMapper.convertItem(r))
                setData(items => {
                    return items.concat(collects)
                })
            }
        })
    }


    const renderItem = (item: CollectItem) => {
        return <View key={item.id + '_collect'} style={style.item}>
            <View style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <Text>{item.title}</Text>
            </View>
            <View style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <Text>{item.fromAuthor}</Text>
                <Text>{item.createdAt}</Text>
            </View>
        </View>
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
            }} />
            <View style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center',
            }}>
                <TouchableOpacity style={style.headerButton}>
                    <Text style={{ color: themeState.primary }}>Recently used</Text>
                </TouchableOpacity>
                <TouchableOpacity style={style.headerButton}>
                    <Text style={{ color: themeState.primary }}>Links</Text>
                </TouchableOpacity>
                <TouchableOpacity style={style.headerButton}>
                    <Text style={{ color: themeState.primary }}>Media</Text>
                </TouchableOpacity>
                <TouchableOpacity style={style.headerButton}>
                    <Text style={{ color: themeState.primary }}>Audio</Text>
                </TouchableOpacity>
                <TouchableOpacity style={style.headerButton}>
                    <Text style={{ color: themeState.primary }}>File</Text>
                </TouchableOpacity>
            </View>

            <View style={{
                flex: 1,
            }}>
                <FlashList
                    style={{
                        flex: 1
                    }}
                    data={data}
                    onEndReached={() => {
                        loadData(page)
                    }}
                    showsVerticalScrollIndicator
                    renderItem={({ item, index }) => renderItem(item)}
                    estimatedItemSize={s(76)}
                    keyExtractor={(item) => item.id + '_collect'}
                />

            </View>
        </View>

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
    }
})
