import { StackScreenProps } from "@react-navigation/stack";
import { View } from "react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "app/components/Navbar";
import { TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import groupService from "app/services/group.service";
import { ChatDetailItem, GroupDetailItem, GroupMemberItemVO } from "@repo/types";
import PagerView from "react-native-pager-view";
import ChatPage, { GroupChatPageRef } from './ChatPage';
import InfoPage from "./info/Index";
import { GroupChatUiContext } from "./context";
import { useRecoilState } from "recoil";
import { IUser } from "drizzle/schema";
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { App } from "types/app";
import { AuthUser } from "app/stores/auth";
import toast from "app/utils/toast";
import { scale } from "app/utils/size";
import { colors } from "app/theme";


type Props = StackScreenProps<App.StackParamList, 'GroupChatScreen'>;


export const GroupChatScreen = ({ navigation, route }: Props) => {
    const insets = useSafeAreaInsets();
    const chatItemRef = useRef<ChatDetailItem>()

    const groupIdRef = useRef<number>(-1)
    const [group, setGroup] = useState<GroupDetailItem>()
    const [authUser, _] = useRecoilState<IUser | null>(AuthUser)
    // const groupRef = useRef<GroupDetailItem>()
    const [pageIndex, setPageIndex] = useState(0);
    const chatPageRef = useRef<GroupChatPageRef>(null);
    const pagerViewRef = useRef<PagerView>(null);
    const [members, setMembers] = useState<GroupMemberItemVO[]>([]);

    const selfMemberRef = useRef<GroupMemberItemVO>()
    const { t } = useTranslation('screen-group-chat')

    // TODO: 這裏是根據uid變化而部分請求接口的函數
    const refreshMember = useCallback(async (uids: string[]) => {
        loadMembers()
    }, []);

    const loadMembers = useCallback(async () => {
        groupService.getMemberList(groupIdRef.current).then((res) => {
            setMembers(res)
            const self = res.find(m => m.uid === authUser?.id ?? -1)
            console.log('self===', self);

            if (self !== null) {
                selfMemberRef.current = self
                chatPageRef.current?.init(chatItemRef.current, self);
            }
        });
    }, []);
    const loadGroup = useCallback(async () => {
        const res = await groupService.getInfo(groupIdRef.current)
        console.log('羣信息', res);
        if (res === null) {
            toast(t('error_group'))
            return
        }
        setGroup(res);
        return res
    }, [])
    const init = useCallback(async () => {

        if (!globalThis.wallet) {
            toast(t('error_wallet_init'));
            return;
        }

        const _chatItem = route.params.item as ChatDetailItem
        console.log(_chatItem);
        chatItemRef.current = _chatItem
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
                height: 40,
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
                            <TouchableOpacity onPress={() => {
                                pagerViewRef.current?.setPage(0);
                            }}>
                                <Image source={require('assets/icons/chat.svg')} style={{
                                    width: scale(32),
                                    height: scale(32),
                                    tintColor: colors.palette.gray800
                                }} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                pagerViewRef.current?.setPage(1);
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
                selfMember: selfMemberRef.current,
                reloadMember: loadMembers,
                reloadMemberByUids: refreshMember,
                reloadGroup: loadGroup
            }}>
                <PagerView ref={pagerViewRef}
                    scrollEnabled={false}
                    style={{
                        flex: 1,
                        backgroundColor: '#F4F4F4',
                    }} onPageSelected={(v) => {
                        setPageIndex(v.nativeEvent.position);
                    }} initialPage={pageIndex}>
                    <ChatPage ref={chatPageRef} />
                    {/* <InfoPage authUser={selfMemberRef.current} group={group ?? undefined} /> */}
                </PagerView>
            </GroupChatUiContext.Provider>
        </View>

    )
} 