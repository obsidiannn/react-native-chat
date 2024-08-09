import { StackScreenProps } from "@react-navigation/stack";
import { View } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "app/components/Navbar";
import { TouchableOpacity } from "react-native";
import groupService from "app/services/group.service";
import { ChatDetailItem, GroupDetailItem, GroupMemberItemVO } from "@repo/types";
import ChatPage, { GroupChatPageRef } from './ChatPage';
import { GroupChatUiContext } from "./context";
import { useRecoilValue } from "recoil";
import { IUser } from "drizzle/schema";
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { App } from "types/app";
import { AuthUser } from "app/stores/auth";
import toast from "app/utils/toast";
import { s } from "app/utils/size";
import GroupInfoModal, { GroupInfoModalType } from './info/Index'
import { ColorsState } from "app/stores/system";
import chatService from "app/services/chat.service";
import { IconFont } from "app/components/IconFont/IconFont";
import { LocalGroupService } from "app/services/LocalGroupService";

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
        loadMembers(false, group)
    }, []);

    const loadMembers = useCallback(async (init: boolean = false, group: GroupDetailItem) => {
        if (init) {
            const localMembers = await groupService.getLocalMemberList(groupIdRef.current)
            const self = localMembers.find(m => m.uid === authUser?.id ?? -1)
            selfMemberRef.current = self
            setMembers(localMembers)
            console.log('-----', self, localMembers);
            setSelfMember(self)
        }
        groupService.getMemberList(groupIdRef.current).then((res) => {
            setMembers(res)
            const self = res.find(m => m.uid === authUser?.id ?? -1)
            console.log('self===', authUser, self);
            if (self !== null) {
                selfMemberRef.current = self
                setSelfMember(self)
            }
        });
    }, []);
    const loadGroup = useCallback(async () => {
        const groupId = groupIdRef.current
        const localGroup = await groupService.queryLocalByIdIn([groupId])
        console.log('localgroup', localGroup);

        if (groupId) {
            const res = await groupService.getMineList([groupId])
            console.log('羣信息', res);
            if (res && res.length > 0) {
                setGroup(res[0]);
                return res[0]
            }
        }
        if (localGroup.has(groupId)) {
            const _g = localGroup.get(groupId)
            setGroup(_g)
            return _g
        }
        return null
    }, [])

    const reloadChat = (chat: ChatDetailItem) => {
        chatService.changeChat(chat).then(() => {
            console.log('[group]reload', chat);
            setChatItem(chat)
        })
        // chatItemRef.current = chat
    }

    const init = useCallback(async () => {
        if (!globalThis.wallet) {
            toast(t('groupChat.error_wallet_init'));
            return;
        }

        const _chatItem = route.params.item as ChatDetailItem
        chatItemRef.current = _chatItem
        groupIdRef.current = _chatItem.sourceId

        console.log('chatPage', _chatItem);

        console.log("sourceId", groupIdRef.current, _chatItem.sourceId);

        setChatItem(_chatItem)

        const _group = await loadGroup()
        console.log('羣id', groupIdRef.current)

        loadMembers(true, _group);
        chatPageRef.current?.init(chatItemRef.current, _group);

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
                            alignItems: 'center',
                            display: 'flex',
                            flexDirection: 'row',
                        }}>

                            <TouchableOpacity style={{
                                backgroundColor: themeColor.background,
                                borderRadius: s(10),
                                padding: s(2)
                            }}
                                onPress={() => {
                                    groupInfoModalRef.current?.open()
                                }}>
                                <IconFont name="ellipsis" color={themeColor.text} size={28} />
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
