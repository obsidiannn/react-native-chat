import { FlashList } from "@shopify/flash-list"
import ConversationItem, { IContactListItemProps } from "app/components/ConversationItem"
import { EmptyComponent } from "app/components/EmptyComponent"
import LoadingComponent from "app/components/Loading"
import { scale } from "app/utils/size"
import { useState } from "react"
import { StyleSheet, Text, View, ActivityIndicator } from "react-native"
import { useRecoilValue } from "recoil"
import { navigate } from "app/navigators"
import { useTranslation } from "react-i18next"
import { ColorsState } from "app/stores/system"
import { IUser } from "drizzle/schema"
import ContractListItem from "app/components/ContractListItem"
import chatService from "app/services/chat.service"
import toast from "app/utils/toast"



const FriendListView = (props: { contacts: IUser[] }) => {
  const themeColor = useRecoilValue(ColorsState)
  const [loading, setLoading] = useState<boolean>(false)
  const { t } = useTranslation('friend')
  const renderList = () => {
    return <View style={{
      flex: 1,
      width: '100%',
      flexDirection: 'column',
    }}>
      <ContractListItem onPress={() => {
        navigate("FriendInviteRecordScreen")
      }} icon={require('assets/icons/friend-add.svg')} bottomLine={props.contacts.length > 1} title="新的好友" />
      <View style={{
        marginBottom: scale(14)
      }}></View>
      {
        renderState()
      }
    </View>
  }


  const renderState = () => {
    if (loading) {
      return <LoadingComponent />
    } else {
      return props.contacts.length <= 0 ? <EmptyComponent /> : (
        <FlashList
          // ref={listRef}
          keyExtractor={(item) => "friend" + item.id.toString()}
          estimatedItemSize={scale(76)}
          data={props.contacts}
          renderItem={({ item, index }) => {
            return <ContractListItem onPress={async () => {
              const chatDetail = await chatService.findById(String(item.chatId));
              if (!chatDetail || chatDetail === null) {
                toast("會話不存在")
                return
              }
              console.log('chatDetail', chatDetail);

              navigate('UserChatUI', {
                item: chatDetail,
                userId: chatDetail.sourceId
              })
            }} icon={item.avatar}
              title={!item?.userName ? item.nickName : item.userName}
              bottomLine={props.contacts.length > 1 && index < props.contacts.length - 1} />;
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

export default FriendListView
