import { StackScreenProps } from "@react-navigation/stack";
import { View } from "react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "app/components/Navbar";
import { TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import groupService from "app/services/group.service";
import { ChatDetailItem, GroupDetailItem, GroupMemberItemVO } from "@repo/types";
import ChatPage, { GroupChatPageRef } from './ChatPage';
import { GroupChatUiContext } from "./context";
import { useRecoilState, useRecoilValue } from "recoil";
import { IUser } from "drizzle/schema";
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { App } from "types/app";
import { AuthUser } from "app/stores/auth";
import toast from "app/utils/toast";
import { scale } from "app/utils/size";
import { colors } from "app/theme";
import GroupInfoModal, { GroupInfoModalType } from './info/Index'
import { ColorsState } from "app/stores/system";

type Props = StackScreenProps<App.StackParamList, 'GroupChatScreen'>;


export const GroupChatScreen = ({ navigation, route }: Props) => {
    const insets = useSafeAreaInsets();
    const chatItemRef = useRef<ChatDetailItem>()
    const [chatItem, setChatItem] = useState<ChatDetailItem>()

    const groupIdRef = useRef<number>(-1)
    const [group, setGroup] = useState<GroupDetailItem>()
    const authUser = useRecoilValue<IUser>(AuthUser)
    // const groupRef = useRef<GroupDetailItem>()
    const groupInfoModalRef = useRef<GroupInfoModalType>(null)
    const chatPageRef = useRef<GroupChatPageRef>(null);
    const [members, setMembers] = useState<GroupMemberItemVO[]>([]);

    const themeColor = useRecoilValue(ColorsState)
    const selfMemberRef = useRef<GroupMemberItemVO>()
    const [selfMember, setSelfMember] = useState<GroupMemberItemVO>()
    const { t } = useTranslation('screens')

    // TODO: 這裏是根據uid變化而部分請求接口的函數
    const refreshMember = useCallback(async (uids: number[]) => {
        loadMembers()
    }, []);

    const loadMembers = useCallback(async () => {
        groupService.getMemberList(groupIdRef.current).then((res) => {
            setMembers(res)
            const self = res.find(m => m.uid === authUser?.id ?? -1)
            console.log('self===', self);

            if (self !== null) {
                selfMemberRef.current = self
                setSelfMember(self)
                chatPageRef.current?.init(chatItemRef.current, self);
            }
        });
    }, []);
    const loadGroup = useCallback(async () => {
        const res = await groupService.getInfo(groupIdRef.current)
        console.log('羣信息', res);
        if (res === null) {
            toast(t('groupChat.error_group'))
            return
        }
        setGroup(res);
        return res
    }, [])

    const reloadChat = (chat: ChatDetailItem) => {
        console.log('[group]reload', chat);

        // chatItemRef.current = chat
        setChatItem(chat)
    }

    const init = useCallback(async () => {

        if (!globalThis.wallet) {
            toast(t('groupChat.error_wallet_init'));
            return;
        }

        const _chatItem = route.params.item as ChatDetailItem
        console.log(_chatItem);
        chatItemRef.current = _chatItem
        setChatItem(_chatItem)
        groupIdRef.current = _chatItem.sourceId ?? ''
        console.log('羣id', groupIdRef.current)
        await loadGroup()
        loadMembers();
    }, [])
    useEffect(() => {
        // 監聽頁面獲取焦點
        const focusEvent = navigation.addListener('focus', () => {
            init();
        });
        const blurEvent = navigation.addListener('blur', () => {
            chatPageRef.current?.close();
        });
        return () => {
            focusEvent();
            blurEvent();
        }
    }, [navigation])


    return (
        <View
            style={{
                flex: 1,
                backgroundColor: 'white',
                paddingTop: insets.top
            }}>

            <View style={{
                width: '100%',
                backgroundColor: 'white',
            }}>
                <Navbar title={group?.name ?? ''}
                    onLeftPress={() => {
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
                            flexDirection: 'row',
                        }}>

                            <TouchableOpacity style={{ 
                                backgroundColor: themeColor.background,
                                borderRadius: scale(10)
                             }}
                                onPress={() => {
                                    groupInfoModalRef.current?.open()
                                }}>
                                <Image source={require('assets/icons/more.svg')} style={{
                                    width: scale(32),
                                    height: scale(32),
                                    tintColor: colors.palette.gray800
                                }} />
                            </TouchableOpacity>

                        </View>
                    }} />
            </View>

            <GroupChatUiContext.Provider value={{
                members: members,
                group: group,
                chatItem: chatItem,
                selfMember: selfMember,
                reloadMember: loadMembers,
                reloadMemberByUids: refreshMember,
                reloadGroup: loadGroup,
                reloadChat: reloadChat
            }}>
                <ChatPage ref={chatPageRef} />
                <GroupInfoModal ref={groupInfoModalRef} />
            </GroupChatUiContext.Provider>
        </View>

    )
} 