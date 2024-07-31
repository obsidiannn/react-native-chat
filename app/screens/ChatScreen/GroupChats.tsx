import { FlashList } from "@shopify/flash-list"
import { EmptyComponent } from "app/components/EmptyComponent"
import LoadingComponent from "app/components/Loading"
import { scale } from "app/utils/size"
import { useState } from "react"
import { StyleSheet, Text, View, ActivityIndicator } from "react-native"
import { useRecoilValue } from "recoil"
import { navigate } from "app/navigators"
import { useTranslation } from "react-i18next"
import { ColorsState } from "app/stores/system"
import ContractListItem from "app/components/ContractListItem"
import chatService from "app/services/chat.service"
import toast from "app/utils/toast"
import { GroupSingleItem } from "@repo/types"
import fileService from "app/services/file.service"



const GroupListView = (props: { groups: GroupSingleItem[] }) => {
    const themeColor = useRecoilValue(ColorsState)
    const [loading, setLoading] = useState<boolean>(false)
    const { t } = useTranslation('screens')
    const renderList = () => {
        return <View style={{
            flex: 1,
            flexDirection: 'column',
        }}>
            <ContractListItem onPress={() => {
                navigate("FriendInviteRecordScreen")
            }} icon={require('assets/icons/group-add.svg')} title="群组等待验证" />
            <View style={{
                marginBottom: scale(14)
            }} />
            {
                renderState()
            }
        </View>
    }


    const renderState = () => {
        if (loading) {
            return <LoadingComponent />
        } else {
            return (!props.groups || props.groups.length <= 0) ? <EmptyComponent /> : (
                <FlashList
                    // ref={listRef}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => "group" + item.id.toString()}
                    estimatedItemSize={scale(76)}
                    data={props.groups}
                    renderItem={({ item, index }) => {
                        return <ContractListItem
                            onPress={async () => {
                                const chatDetail = await chatService.mineChatList(String(item.chatId));
                                if (!chatDetail || chatDetail === null) {
                                    toast("會話不存在")
                                    return
                                }
                                console.log('chatDetail', chatDetail);
                                navigate('GroupChatScreen', {
                                    item: chatDetail,
                                })
                            }}
                            icon={fileService.getFullUrl(item.avatar)}
                            title={item?.name}
                        />;
                    }}
                />
            )
        }
    }

    return <>
        <View style={styles.container}>
            {renderList()}
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

export default GroupListView
