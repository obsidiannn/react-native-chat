import Navbar from "app/components/Navbar";
import { s } from "app/utils/size";
import { useCallback, useEffect, useRef, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import ChatPage, { ChatUIPageRef } from "./ChatPage";
import { ChatDetailItem, ChatTypingEvent } from "@repo/types";
import { IUser } from "drizzle/schema";
import { StackScreenProps } from "@react-navigation/stack";
import { App } from "types/app";
import friendService from "app/services/friend.service";
import { UserChatUIContext } from "./context";
import chatService from "app/services/chat.service";
import UserChatInfoModal, { UserChatInfoModalRef } from "./UserChatInfoModal";
import { useRecoilValue } from "recoil";
import { IconFont } from "app/components/IconFont/IconFont";
import { ColorsState, ThemeState } from "app/stores/system";
import userService from "app/services/user.service";
import { LocalUserService } from "app/services/LocalUserService";
import { LocalChatService } from "app/services/LocalChatService";
import chatMapper from "app/utils/chat.mapper";
import NetInfo from '@react-native-community/netinfo'
import eventUtil from "app/utils/event-util";
import EventManaer from 'app/services/event-manager.service'
import { IModel } from "@repo/enums";
import { AuthUser } from "app/stores/auth";
import { Text } from "react-native";
import { FullScreen } from "app/components/ScreenX";
type Props = StackScreenProps<App.StackParamList, 'UserChatScreen'>;

export const UserChatScreen = ({ navigation, route }: Props) => {

    const [chatItem, setChatItem] = useState<ChatDetailItem>()
    const userChatInfoModalRef = useRef<UserChatInfoModalRef>(null)
    const [user, setUser] = useState<IUser | null>(null);
    const chatPageRef = useRef<ChatUIPageRef>(null)
    const themeColor = useRecoilValue(ColorsState)
    const currentUser = useRecoilValue(AuthUser)
    const [typing, setTyping] = useState(false)
    const loadLocalChat = useCallback(async (chatId: string): Promise<ChatDetailItem | null> => {
        const localChat = await LocalChatService.findById(chatId);
        if (localChat) {
            const item = chatMapper.entity2Dto(localChat)
            setChatItem(item)
            return item
        }
        return null
    }, [])

    const loadRemoteChat = useCallback(async (chatId: string): Promise<ChatDetailItem | null> => {
        const remoteChats = await chatService.mineChatList([chatId])
        if (remoteChats.length > 0) {
            setChatItem(remoteChats[0])
            return remoteChats[0]
        }
        return null
    }, [])

    const loadFriend = useCallback(async (friendId: number): Promise<IUser | null> => {
        const localFriend = await LocalUserService.findById(friendId)
        if (localFriend) {
            setUser(localFriend)
            return localFriend
        }
        return null
    }, [])

    const init = useCallback(async () => {
        const chatId = route.params.chatId
        if (!globalThis.wallet) {
            navigation.goBack();
            return;
        }
        const netInfo = await NetInfo.fetch()
        let chatResult = await loadLocalChat(chatId)
        let localUser = null
        let localChat = true
        if (!chatResult) {
            if (netInfo.isConnected) {
                const remoteChat = await loadRemoteChat(chatId)
                if (remoteChat) {
                    localChat = false
                }
            }
        } else {
            localUser = await loadFriend(chatResult.sourceId)
        }
        console.log('chatItem = ', chatResult);

        if (!localUser || chatResult === null) {
            return
        }

        friendService.getFriendInfoByUserId(chatResult.sourceId).then(friend => {
            if (friend !== null) {
                setUser(friend);
            }
        })
        chatPageRef.current?.init(chatResult, localUser)

        const typeKey = EventManaer.generateKey(IModel.IClient.SocketTypeEnum.RECIEVE_TYPING_CHANGE, chatId)
        EventManaer.addEventListener(typeKey, typingHandle)

    }, [])

    const typingHandle = (e: ChatTypingEvent) => {
        console.log('chat event::::::::::: ', e);
        if (currentUser) {
            if (currentUser?.id !== e.senderId) {
                setTyping(e.flag)
                if (e.flag) {
                    setTimeout(() => {
                        setTyping(false)
                    }, 3000);
                }
            }
            
        }
    }

    const reloadChat = (item: ChatDetailItem) => {
        chatService.changeChat(item).then(() => {
            setChatItem(item)
            eventUtil.sendChatEvent(item.id, 'update', {
                ...item
            })
        }).catch(e => {
            console.error(e)
        })
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
            const typeKey = EventManaer.generateKey(IModel.IClient.SocketTypeEnum.RECIEVE_TYPING_CHANGE, route.params.chatId)
            EventManaer.removeListener(typeKey, typingHandle)
            navigation.removeListener('focus', () => { })
        }
    }, [navigation])


    const renderTitle = () => {
        return <>
            <Text style={{ fontSize: s(18), color: themeColor.text }} >{chatItem?.chatAlias ?? user?.nickName}</Text>
            <Text style={{ fontSize: s(8) }}>{typing ? "typing..." : null}</Text>
        </>
    }
    return <FullScreen theme={$theme}>
        <UserChatUIContext.Provider value={{
            friend: user,
            chatItem: chatItem,
            reloadUser,
            reloadChat
        }}>
            <Navbar
                theme={$theme}
                renderCenter={renderTitle}
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

            <ChatPage theme={$theme} ref={chatPageRef} />
            <UserChatInfoModal theme={$theme} ref={userChatInfoModalRef} />
        </UserChatUIContext.Provider>
    </FullScreen>
}