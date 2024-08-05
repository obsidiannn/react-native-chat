import Navbar from "app/components/Navbar";
import { navigate } from "app/navigators";
import { colors } from "app/theme";
import { s } from "app/utils/size";
import { useSafeAreaInsetsStyle } from "app/utils/useSafeAreaInsetsStyle";
import { Image } from "expo-image";
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
import chatMapper from "app/utils/chat.mapper";
import UserChatInfoModal, { UserChatInfoModalRef } from "./UserChatInfoModal";
import { useRecoilState, useSetRecoilState } from "recoil";
import { ChatsStore } from "app/stores/auth";

type Props = StackScreenProps<App.StackParamList, 'UserChatScreen'>;

export const UserChatScreen = ({ navigation, route }: Props) => {
    const $topContainerInsets = useSafeAreaInsetsStyle(["top"])
    const setChatsStore = useSetRecoilState(ChatsStore)
    const [chatItem, setChatItem] = useState<ChatDetailItem>()
    const userChatInfoModalRef = useRef<UserChatInfoModalRef>(null)
    const [user, setUser] = useState<IUser>();
    const chatPageRef = useRef<ChatUIPageRef>(null)

    const init = useCallback(async () => {
        const _chatItem = route.params.item
        const uid = _chatItem?.sourceId;
        if (!uid || !globalThis.wallet) {
            navigation.goBack();
            return;
        }
        setChatItem(_chatItem)
        const friend = await friendService.getFriendInfoByUserId(uid)
        if (friend !== null) {
            setUser(friend);
            chatPageRef.current?.init(_chatItem, friend)
        }
    }, [])

    const reloadChat = (item: ChatDetailItem) => {
        chatService.changeChat(item).then(() => {
            setChatItem(item)
            setChatsStore((items) => {
                const newItems = items.map(t => {
                    if (item.id === t.id) {
                        return { ...item }
                    }
                    return t
                })
                return newItems
            })
        })
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
            chatItem: chatItem,
            reloadChat: reloadChat
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
                        <TouchableOpacity onPress={() => {
                            console.log('open');
                            
                            userChatInfoModalRef.current?.open()
                        }}>
                            <Image source={require('assets/icons/more.svg')} style={{
                                width: s(32),
                                height: s(32),
                            }} />
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
