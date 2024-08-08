import { StyleSheet, View, TouchableOpacity, TextInput } from "react-native";
import { useRef, useContext, forwardRef, useImperativeHandle, useState } from "react";
import { ConfirmModal, ConfirmModalType } from "app/components/ConfirmModal";
import { s } from "app/utils/size";
import { IconFont } from "app/components/IconFont/IconFont";
import { FormLine } from "app/components/FormLine";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { ColorsState } from "app/stores/system";
import { IUser } from "drizzle/schema";
import BaseModal from "app/components/base-modal";
import { UserChatUIContext } from "../UserChat/context";
import { colors } from "app/theme";
import friendService from "app/services/friend.service";
import { ClearChatMessageEvent, FriendChangeEvent } from "@repo/types";
import { IModel } from "@repo/enums";
import EventManager from 'app/services/event-manager.service'
import { ChatsStore } from "app/stores/auth";
import { navigate } from "app/navigators";
import { LocalUserService } from "app/services/LocalUserService";

export interface UserConfigModalType {
    open: () => void
}

export default forwardRef((props: {
    friend: IUser | null
}, ref) => {
    const [visible, setVisible] = useState(false)
    const themeColor = useRecoilValue(ColorsState)
    const setChatsStore = useSetRecoilState(ChatsStore)
    const confirmModalRef = useRef<ConfirmModalType>(null);
    const [editing, setEditing] = useState(false)
    const userContext = useContext(UserChatUIContext)
    const [friendAlias, setFriendAlias] = useState('')
    const isEditable = (): boolean => {
        return editing && props.friend !== null && ((props.friend.isFriend ?? 0) > 0)
    }

    const changeAlias = async () => {
        const friendId = props.friend?.id
        if (!friendId || !props.friend) {
            return
        }
        await friendService.updateRemark(friendId, friendAlias)
        if (userContext && userContext.reloadChat) {
            userContext.reloadChat({
                ...userContext.chatItem, chatAlias: friendAlias
            })
        }
        if (userContext) {
            const user = {
                ...props.friend,
                friendAlias: friendAlias
            }
            userContext.reloadUser(user)
        }
    }

    const renderCheckButton = () => {
        if (props.friend) {
            if (editing) {
                return <TouchableOpacity
                    onPress={async () => {
                        await changeAlias()
                        setEditing(false)
                    }}
                    style={{
                        padding: s(3),
                        backgroundColor: themeColor.secondaryBackground,
                        borderRadius: s(8)
                    }}>
                    <IconFont name="checkMark" color={themeColor.text} size={24} />
                </TouchableOpacity>
            }
            return <TouchableOpacity
                onPress={async () => {
                    setEditing(true)
                }}
                style={{
                    padding: s(3),
                    backgroundColor: themeColor.secondaryBackground,
                    borderRadius: s(8)
                }}>
                <IconFont name="edit" color={themeColor.text} size={24} />
            </TouchableOpacity>
        }
        return null
    }
    const onClose = () => {
        setFriendAlias(props.friend?.friendAlias ?? props.friend?.nickName ?? '')
        setVisible(false)
    }

    useImperativeHandle(ref, () => {
        return {
            open: () => {
                setFriendAlias(props.friend?.friendAlias ?? props.friend?.nickName ?? '')
                setVisible(true)
            }
        }
    })

    return <BaseModal visible={visible} onClose={onClose} styles={{ flex: 1 }} >
        <View style={{
            flex: 1,
            marginTop: s(32),
            backgroundColor: themeColor.background,
            borderTopLeftRadius: s(24),
            borderTopRightRadius: s(24),
            paddingHorizontal: s(16),

        }}>
            <View style={{
                marginTop: s(15),
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottomWidth: s(0.5),
                borderBottomColor: themeColor.border,
                paddingVertical: s(12)
            }}>
                <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingBottom: s(12)
                }}>
                    <IconFont name="pencil" color={themeColor.text} size={24} />
                    <TextInput
                        editable={isEditable()}
                        value={friendAlias}
                        style={{
                            color: themeColor.text,
                            width: '80%',
                            textAlign: 'left'
                        }}
                        onChangeText={(v) => {
                            setFriendAlias(v)
                        }}
                    />
                </View>

                {
                    renderCheckButton()
                }
            </View>

            <View style={{
                marginTop: s(36),
            }}>
                <FormLine title={'加入黑名单'}
                    textStyle={{
                        color: colors.palette.red500
                    }}
                    renderLeft={
                        <IconFont name="clearDoc" color={colors.palette.red500} size={24} containerStyle={{ marginRight: s(4) }} />
                    }
                    onPress={() => {
                        confirmModalRef.current?.open({
                            title: '加入黑名单',
                            content: '确认加入黑名单',
                            onSubmit: async () => {
                                console.log(props.friend);

                                if (props.friend?.friendId) {
                                    const isShow = await friendService.block(props.friend?.friendId)
                                    if (isShow !== null && props.friend?.chatId) {
                                        setChatsStore((items) => {
                                            return items.filter(i => i.id !== props.friend?.chatId)
                                        })
                                        await LocalUserService.block([props.friend.id])

                                    }

                                    const event: FriendChangeEvent = {
                                        friendId: props.friend.id ?? 0,
                                        remove: true,
                                        type: IModel.IClient.SocketTypeEnum.FRIEND_CHANGE
                                    }
                                    const eventKey = EventManager.generateKey(event.type)
                                    EventManager.emit(eventKey, event)
                                }
                            }
                        })
                    }}
                />
            </View>
            <View style={{
                marginTop: s(36),
            }}>
                <FormLine title={'删除好友'}
                    textStyle={{
                        color: colors.palette.red500
                    }}
                    renderLeft={
                        <IconFont name="trash" color={colors.palette.red500} size={24} containerStyle={{ marginRight: s(4) }} />
                    }
                    onPress={() => {
                        confirmModalRef.current?.open({
                            title: '删除好友',
                            content: '确认删除好友，聊天记录将不可恢复',
                            onSubmit: () => {
                                friendService.remove(props.friend?.friendId ?? 0).then((chatId) => {
                                    if (chatId) {
                                        const event: ClearChatMessageEvent = { chatId, type: IModel.IClient.SocketTypeEnum.CLEAR_ALL_MESSAGE }
                                        const eventKey = EventManager.generateChatTopic(chatId)
                                        EventManager.emit(eventKey, event)
                                    }
                                    // 修改chats 
                                    setChatsStore((items) => {
                                        return items.filter(i => i.id !== props.friend?.chatId)
                                    })
                                    navigate('TabStack')
                                })
                            }
                        })
                    }}
                />
            </View>

        </View>
        <ConfirmModal ref={confirmModalRef} />
    </BaseModal>
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
});
