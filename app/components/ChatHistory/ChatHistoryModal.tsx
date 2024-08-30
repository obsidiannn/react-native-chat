import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Text, View } from "react-native";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import { StyleSheet } from "react-native";
import {  s } from "app/utils/size";
import { SearchInput } from "./SearchInput";
import { FlashList } from "@shopify/flash-list";
import { MessageType } from "../chat-ui";
import { LocalMessageService } from "app/services/LocalMessageService";
import { LocalUserService } from "app/services/LocalUserService";
import userService from "app/services/user.service";
import chatUiAdapter from "app/utils/chat-ui.adapter";
import AvatarX from "../AvatarX";
import fileService from "app/services/file.service";
import dateUtil from "app/utils/dateUtil";
import ImageRecordModal, { ImageRecordModalType } from "./ImageRecordModal";
import { ScreenModal, ScreenModalType } from "../ScreenModal";

/**
 * 聊天记录查找
*/

export interface ChatHistoryModalType {
    open: (chatId: string) => void
}

export default forwardRef((props:{
    theme: 'light' | 'dark'
}, ref) => {

    const [chatId, setChatId] = useState<string | null>(null)
    const themeColor = useRecoilValue(ColorsState)
    const [keyword, setKeyword] = useState<string>('')
    const [msgs, setMsgs] = useState<MessageType.Any[]>([])

    const imageRecordModalRef = useRef<ImageRecordModalType>(null)

    const style = styles({ themeColor })

    useImperativeHandle(ref, () => ({
        open: (_chatId: string) => {
            setChatId(_chatId)
            screenModalRef.current?.open()
        }
    }));

    const onSearch = async (v: string, type: MessageType.Any['type']) => {
        setKeyword(v)
        if (chatId) {
            const entities = await LocalMessageService.queryList(chatId, type, v)
            const userIdSet = new Set<number>(entities.map(i => i.uid))
            const users = await LocalUserService.findByIds(Array.from(userIdSet.keys()))
            const userHash = userService.initUserHash(users)
            const tmps = entities.map((e) => {
                const item = chatUiAdapter.messageEntity2Dto(e)
                const user = userHash.get(item?.senderId ?? -1)
                if (user) {
                    return {
                        ...item,
                        author: chatUiAdapter.userTransfer(user)
                    }
                }
                return item
            });
            setMsgs(tmps)
            if (type === 'image') {
                imageRecordModalRef.current?.open()
            }
        }
    }

    const renderItem = (item: MessageType.Any) => {
        if (item.type === 'text') {
            const textItem = item as MessageType.Text
            return <View style={style.itemContainer}>
                <AvatarX border uri={fileService.getFullUrl(textItem.author.imageUrl ?? '')} size={36} />
                <View style={{
                    flex: 1,
                    marginLeft: s(12),
                }}>
                    <View style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <Text style={style.itemTitle}>{textItem.author.firstName}</Text>
                        <Text style={style.itemTitle}>{dateUtil.second2Label((textItem.createdAt ?? 0) / 1000, 'YYYY/MM/DD')}</Text>
                    </View>
                    <Text style={{
                        color: themeColor.text,
                        fontSize: s(14)
                    }}>{renderTextWithHighlights(textItem.text, [keyword])}</Text>
                </View>
            </View>
        }
        return <></>
    }
    const renderTextWithHighlights = (sentence: string, highlightedWords: string[]) => {
        // 遍历每个高亮词并用split进行分割处理
        let parts = [sentence];
        highlightedWords.forEach((word) => {
            let newParts: any[] = [];
            parts.forEach((part) => {
                if (typeof part === 'string') {
                    const splitParts = part.split(word);
                    for (let i = 0; i < splitParts.length; i++) {
                        newParts.push(splitParts[i]);
                        if (i < splitParts.length - 1) {
                            newParts.push(<Text style={style.highlightedText} key={Math.random().toString()}>{word}</Text>);
                        }
                    }
                } else {
                    newParts.push(part);
                }
            });
            parts = newParts;
        });

        return parts.map((part, index) =>
            typeof part === 'string' ? <Text key={index}>{part}</Text> : part
        );
    }
    const screenModalRef = useRef<ScreenModalType>(null)
    return <ScreenModal ref={screenModalRef} theme={props.theme}>
        <View style={style.container}>
            <SearchInput onSearch={onSearch} color={themeColor} />
            <View style={{
                flex: 1
            }}>
                <FlashList
                    data={msgs}
                    renderItem={({ item, index }) => renderItem(item)}
                    estimatedItemSize={s(80)}
                    keyExtractor={item => item.id}
                />
            </View>
        </View>
        <ImageRecordModal theme={props.theme} ref={imageRecordModalRef} images={msgs as MessageType.Image[]} />
    </ScreenModal>
})

const styles = ({ themeColor }: { themeColor: IColors }) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themeColor.background,
        marginTop: s(32),
        borderTopLeftRadius: s(32),
        borderTopRightRadius: s(32),
        padding: s(24)

    },
    itemContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderBottomColor: themeColor.border,
        borderBottomWidth: s(0.5),
        padding: s(8)
    },
    itemTitle: {
        color: themeColor.secondaryText,
        fontSize: s(12)
    },
    highlightedText: {
        color: '#00A423'
    }
})