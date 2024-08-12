import { FlashList } from "@shopify/flash-list"
import ConversationItem from "app/components/ConversationItem"
import { EmptyComponent } from "app/components/EmptyComponent"
import { formatDate } from "app/utils/formatDate"
import { s } from "app/utils/size"
import { useMemo } from "react"
import { StyleSheet, View } from "react-native"
import dayjs from 'dayjs'
import { useRecoilValue } from "recoil"
import { ChatsStore } from "app/stores/auth"
import { IModel } from "@repo/enums"
import { ChatDetailItem } from "@repo/types"
import { navigate } from "app/navigators"


const ChatView = () => {

    const chats = useRecoilValue(ChatsStore)

    const { topChats, normalChats } = useMemo(() => {
        const topChats: ChatDetailItem[] = []
        const normalChats: ChatDetailItem[] = []

        chats.forEach(c => {
            if (c.isTop === IModel.ICommon.ICommonBoolEnum.YES) {
                topChats.push(c)
            } else {
                normalChats.push(c)
            }
        })
        return {
            topChats, normalChats
        }
    }, [chats])


    const renderList = () => {
        return <View style={{
            flex: 1,
            width: '100%',
        }}>
            <FlashList
                keyExtractor={(item) => item.id}
                data={topChats.concat(normalChats)}
                renderItem={({ item, index }) => renderItem(item, index === chats.length - 1)}
                estimatedItemSize={s(76)}
                showsVerticalScrollIndicator={false}
            />
        </View>
    }

    const getOnlineStatus = (item: ChatDetailItem): boolean | undefined => {
        if (item.type === IModel.IChat.IChatTypeEnum.NORMAL) {
            return true
        }
        return undefined
    }

    const renderItem = (item: ChatDetailItem, isLast: boolean) => {
        const unread = item.lastSequence - item.lastReadSequence
        const online = getOnlineStatus(item)
        return <ConversationItem
            key={item.id}
            badgeNumber={unread}
            bottomLine={!isLast}
            icon={item.avatar}
            title={item.chatAlias}
            describe={item.describe}
            subTitle={formatDate(dayjs().toISOString())}
            online={online}
            inhibite={item.isMute === IModel.ICommon.ICommonBoolEnum.YES}
            onPress={() => {
                itemPress(item)
            }}
        />
    }
    /**
     * 点击跳转
     * @param item
     */
    const itemPress = (item: ChatDetailItem) => {
        if (item.type === IModel.IChat.IChatTypeEnum.NORMAL) {
            navigate('UserChatScreen', {
                item,
                chatId: item.id
            })
        } else if (item.type === IModel.IChat.IChatTypeEnum.GROUP) {
            console.log('group item', item);
            navigate('GroupChatScreen', {
                item,
                chatId: item.id
            })
        } else if (item.type === IModel.IChat.IChatTypeEnum.OFFICIAL) {
            // console.log('official item', item);
            // navigate('OfficialChat', {
            //     item
            // })
        }
    }

    const renderState = () => {
        return chats.length <= 0 ? <EmptyComponent /> : renderList()
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
