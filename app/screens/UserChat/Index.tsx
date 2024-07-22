import Navbar from "app/components/Navbar";
import { navigate } from "app/navigators";
import { colors } from "app/theme";
import { scale } from "app/utils/size";
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

type Props = StackScreenProps<App.StackParamList, 'UserChatScreen'>;

export const UserChatScreen = ({ navigation, route }: Props) => {
    const $topContainerInsets = useSafeAreaInsetsStyle(["top"])

    const [chatItem, setChatItem] = useState<ChatDetailItem>()
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
                        navigate('UserChatInfoModal',{
                            user,
                            chatId: chatItem?.id
                        })
                    }}>
                        <Image source={require('assets/icons/more.svg')} style={{
                            width: scale(32),
                            height: scale(32),
                        }} />
                    </TouchableOpacity>
                </View>
            }} />
        <ChatPage ref={chatPageRef} />
    </View>
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
        padding: scale(18),
        paddingLeft: 0
    },
    tabButton: {
        fontSize: scale(10),
        marginRight: scale(18),
        padding: 0,
        paddingVertical: scale(8),
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