import { FlashList } from "@shopify/flash-list"
import ConversationItem, { IContactListItemProps } from "app/components/ConversationItem"
import { EmptyComponent } from "app/components/EmptyComponent"
import LoadingComponent from "app/components/Loading"
import { formatDate } from "app/utils/formatDate"
import { scale } from "app/utils/size"
import { useState } from "react"
import { StyleSheet, Text, View, ActivityIndicator } from "react-native"
import dayjs from 'dayjs'
import { useRecoilValue } from "recoil"
import { ChatsStore } from "app/stores/auth"
import { IModel } from "@repo/enums"
import { ChatDetailItem } from "@repo/types"
import { navigate } from "app/navigators"


const ChatView = () => {

    const chats = useRecoilValue(ChatsStore)
    const [loading, setLoading] = useState<boolean>(false)

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
            describe={item.describe}
            subTitle={formatDate(dayjs().toISOString())}
            online={true}
            inhibite={item.isMute === IModel.ICommon.ICommonBoolEnum.YES}
            onPress={() => {
                console.log('jjj');
                
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
            console.log('jump');
            
            navigate('UserChatScreen', {
                item,
            })
        } else if (item.type === IModel.IChat.IChatTypeEnum.GROUP) {
            console.log('group item', item);
            navigate('GroupChatScreen', {
                item
            })
        } else if (item.type === IModel.IChat.IChatTypeEnum.OFFICIAL) {
            // console.log('official item', item);
            // navigate('OfficialChat', {
            //     item
            // })
        }
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
