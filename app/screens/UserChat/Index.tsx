import Navbar from "app/components/Navbar";
import { colors } from "app/theme";
import { s } from "app/utils/size";
import { useSafeAreaInsetsStyle } from "app/utils/useSafeAreaInsetsStyle";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import ChatPage, { ChatUIPageRef } from "./ChatPage";
import { ChatDetailItem } from "@repo/types";
import { IUser } from "drizzle/schema";
import { StackScreenProps } from "@react-navigation/stack";
import { App } from "types/app";
import friendService from "app/services/friend.service";
import { UserChatUIContext } from "./context";
import chatService from "app/services/chat.service";
import UserChatInfoModal, { UserChatInfoModalRef } from "./UserChatInfoModal";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { ChatsStore } from "app/stores/auth";
import { IconFont } from "app/components/IconFont/IconFont";
import { ColorsState } from "app/stores/system";
import userService from "app/services/user.service";
import { LocalUserService } from "app/services/LocalUserService";
import { LocalChatService } from "app/services/LocalChatService";

type Props = StackScreenProps<App.StackParamList, 'UserChatScreen'>;

export const UserChatScreen = ({ navigation, route }: Props) => {
    const $topContainerInsets = useSafeAreaInsetsStyle(["top"])
    const setChatsStore = useSetRecoilState(ChatsStore)
    const [chatItem, setChatItem] = useState<ChatDetailItem>()
    const userChatInfoModalRef = useRef<UserChatInfoModalRef>(null)
    const [user, setUser] = useState<IUser | null>(null);
    const chatPageRef = useRef<ChatUIPageRef>(null)
    const themeColor = useRecoilValue(ColorsState)
    const init = useCallback(async () => {
        console.log("初始化聊天页面")
        const _chatItem = route.params.item
        const uid = _chatItem?.sourceId;
        if (!uid || !globalThis.wallet) {
            navigation.goBack();
            return;
        }
        const localChat = await LocalChatService.findById(_chatItem.id);
        console.log('[chatui] init', localChat)
        setChatItem({
            ..._chatItem,
            firstSequence: localChat?.firstSequence ?? 0,
            lastSequence: localChat?.lastSequence ?? 0,
        });
        const localUsers = await LocalUserService.findByIds([uid], false)
        if (localUsers.length > 0) {
            setUser(localUsers[0])
        }
        const friend = await friendService.getFriendInfoByUserId(uid)
        if (friend !== null) {
            setUser(friend);
        }
        chatPageRef.current?.init(_chatItem, friend ?? localUsers[0])
    }, [])

    const reloadChat = (item: ChatDetailItem) => {
        // chatService.changeChat(item).then(() => {
        //     setChatItem(item)
        //     setChatsStore((items) => {
        //         const newItems = items.map(t => {
        //             if (item.id === t.id) {
        //                 return { ...item }
        //             }
        //             return t
        //         })
        //         return newItems
        //     })
        // }).catch(e => {
        //     console.error(e)
        // })
    }

    const reloadUser = (item: IUser) => {
        if (item) {
            userService.updateUser(item).then(() => {
                setUser(item)
            }).catch(e => {
                console.error(e)
            })
        }

    }


    useEffect(() => {
        navigation.addListener('focus', () => {
            init()
        });
        return () => {
            navigation.removeListener('focus', () => { })
        }
    }, [navigation])


    return <View style={[styles.container, $topContainerInsets, {
        backgroundColor: '#ffffff'
    }]}>
        <UserChatUIContext.Provider value={{
            friend: user,
            chatItem: chatItem,
            reloadUser,
            reloadChat
        }}>
            <Navbar title={chatItem?.chatAlias}
                onLeftPress={() => {
                    void chatPageRef.current?.close()
                    if (route.params.fromNotify) {
                        navigation.replace('TabStack')
                    } else {
                        navigation.goBack()
                    }
                }}
                renderRight={() => {
                    return <View style={{
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        display: 'flex',
                        flexDirection: 'row'
                    }}>
                        <TouchableOpacity onPress={() => userChatInfoModalRef.current?.open()} style={{
                            backgroundColor: themeColor.background,
                            padding: 2,
                            borderRadius: s(8)
                        }}>
                            <IconFont name="ellipsis" color={themeColor.text} size={24} />
                        </TouchableOpacity>
                    </View>
                }} />

            <ChatPage ref={chatPageRef} />
            <UserChatInfoModal ref={userChatInfoModalRef} />
        </UserChatUIContext.Provider>
    </View >
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    topContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: s(18),
        paddingLeft: 0
    },
    tabButton: {
        fontSize: s(10),
        marginRight: s(18),
        padding: 0,
        paddingVertical: s(8),
        display: 'flex',
        flexDirection: 'row',
        minHeight: 0
    },
    tabDefault: {
        backgroundColor: colors.palette.gray200,
        color: colors.palette.primary,
        borderColor: colors.palette.gray200,
    },
    tabChecked: {
        backgroundColor: colors.palette.primary,
        color: colors.palette.gray200,
        borderColor: colors.palette.primary,
    },
    textDefault: {
        color: colors.palette.primary,
    },
    textChecked: {
        color: colors.palette.gray200
    },
})
