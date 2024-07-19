import { FlashList } from "@shopify/flash-list"
import ConversationItem, { IContactListItemProps } from "app/components/ConversationItem"
import { EmptyComponent } from "app/components/EmptyComponent"
import LoadingComponent from "app/components/Loading"
import { formatDate } from "app/utils/formatDate"
import { scale } from "app/utils/size"
import { useEffect, useState } from "react"
import { StyleSheet, Text, View, ActivityIndicator } from "react-native"
import dayjs from 'dayjs'

interface ChatDetailItem {
    id: string;
    creatorId: string;
    type: number;
    status: number;
    isEnc: number;
    lastReadSequence: number;
    lastSequence: number;
    firstSequence: number
    lastTime: number;
    createdAt: number;
    avatar: string
    sourceId: number
    chatAlias: string
    isTop: number
    chatUserId: string
};

const ChatView = () => {

    const [chats, setChats] = useState<ChatDetailItem[]>([])
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        setChats([
            {
                id: "1",
                creatorId: "2",
                type: 2,
                status: 1,
                isEnc: 1,
                lastReadSequence: 10,
                lastSequence: 15,
                firstSequence: 1,
                lastTime: dayjs().valueOf(),
                createdAt: dayjs().valueOf(),
                avatar: "https://avatars.githubusercontent.com/u/122279700",
                sourceId: 1,
                chatAlias: "system",
                isTop: 1,
                chatUserId: "1"
            },
            {
                id: "2",
                creatorId: "2",
                type: 2,
                status: 1,
                isEnc: 1,
                lastReadSequence: 10,
                lastSequence: 15,
                firstSequence: 1,
                lastTime: dayjs().valueOf(),
                createdAt: dayjs().valueOf(),
                avatar: "https://avatars.githubusercontent.com/u/122279700",
                sourceId: 1,
                chatAlias: "chat user",
                isTop: 1,
                chatUserId: "1"
            },
        ])
    }, [])
    const renderList = () => {
        return <View style={{
            flex: 1,
            width: '100%',
        }}>
            <FlashList
                keyExtractor={(item) => item.id.toString()}
                data={chats}
                renderItem={({ item, index }) => renderItem(item, index === chats.length - 1)}
                estimatedItemSize={scale(76)}
            />
        </View>
    }

    const renderItem = (item: ChatDetailItem, isLast: boolean) => {
        const unread = item.lastSequence - item.lastReadSequence
        return <ConversationItem
            key={item.id}
            badgeNumber={unread}
            bottomLine={!isLast}
            icon={item.avatar}
            title={item.chatAlias}
            describe="您有一个新的好友申请"
            subTitle={formatDate(dayjs().toISOString())}
            online={isLast ? true: undefined}
            inhibite={isLast}
            onPress={() => {
                itemPress(item)
            }}
        />
    }

    const itemPress = (item: ChatDetailItem) => {

    }

    const renderState = () => {
        if (loading) {
            return <LoadingComponent />
        } else {
            return chats.length <= 0 ? <EmptyComponent /> : renderList()
        }
    }

    return <>
        <View style={styles.container}>
            {renderState()}
        </View>
    </>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    }
})

export default ChatView
