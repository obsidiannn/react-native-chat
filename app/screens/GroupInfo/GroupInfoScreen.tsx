import { StyleSheet, Text, View } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useMemo, useRef, useState } from "react";
import { GroupDetailItem, GroupMemberResp } from "@repo/types";
import { useTranslation } from 'react-i18next';
import ApplyJoinModal, { ApplyJoinModalRef } from "app/components/ApplyJoinModal";
import groupService from "app/services/group.service";
import userService from "app/services/user.service";
import { App } from "types/app";
import Navbar from "app/components/Navbar";
import { scale } from "app/utils/size";
import { Image } from "expo-image";
import { Button } from "app/components";
import chatService from "app/services/chat.service";
import fileService from "app/services/file.service";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
type Props = StackScreenProps<App.StackParamList, 'GroupInfoScreen'>;

export const GroupInfoScreen = ({ navigation, route }: Props) => {
    const insets = useSafeAreaInsets();
    const [group, setGroup] = useState<GroupDetailItem | null>(null);
    const applyJoinModalRef = useRef<ApplyJoinModalRef>(null);
    const [groupMemberPage, setGroupMemberPage] = useState<GroupMemberResp>()
    const themeColor = useRecoilValue(ColorsState)
    const { t } = useTranslation('screens')
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            const _group = route.params.group
            setGroup(_group)
            groupService.getMemberPage({ id: _group.id, limit: 5, page: 1 }).then(memberPage => {
                console.log('member=', memberPage);

                const uids = memberPage.items.map(m => m.uid)
                if (uids.length > 0) {
                    userService.getUserHash(uids).then(uHash => {
                        const items = memberPage.items.map(m => {
                            return {
                                ...m,
                                avatar: uHash.get(m.uid)?.avatar ?? ''
                            }
                        })
                        setGroupMemberPage({ ...memberPage, items: items })
                    })
                }
                setGroupMemberPage(memberPage)
            })

        });
        return unsubscribe;
    }, [navigation])

    return (
        <View style={{
            ...styles.container,
            paddingTop: insets.top,
            backgroundColor: '#F4F4F4',
            paddingBottom: insets.bottom,
        }}>
            <View>
                <Navbar title="羣聊詳情" onLeftPress={() => {
                    if (route.params.outside) {
                        navigation.replace('TabStack')
                    } else {
                        navigation.goBack()
                    }
                }} />
            </View>
            <View style={{
                paddingHorizontal: scale(15),
                paddingTop: scale(20)
            }}>
                <View style={{
                    padding: scale(15),
                    backgroundColor: '#ffffff',
                    // 生成陰影
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: 1,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 1,
                    elevation: 1,
                    borderRadius: scale(15),
                    borderWidth: 1,
                    borderColor: '#EFF0F1',
                }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>

                            <Image style={{
                                width: scale(50),
                                height: scale(50),
                                borderRadius: scale(25),
                                borderWidth: 1,
                                borderColor: '#EAEDEF',
                                marginRight: scale(15),
                            }} source={group?.avatar} />
                            <View>
                                <Text style={{
                                    fontSize: scale(16),
                                    fontWeight: '400',
                                    color: '#333333',
                                }}>{group?.name}</Text>
                                <Text style={{
                                    fontSize: scale(13),
                                    fontWeight: '400',
                                    color: '#999999',
                                }}>
                                    {group?.desc}adawd
                                </Text>
                            </View>

                        </View>
                        <Button onPress={() => {
                            if ((group?.role ?? -1) > 0) {
                                chatService.chatDetail(group?.chatId ?? '').then(res => {
                                    if (res.length > 0) {
                                        const chatItem = res[0]
                                        navigation.navigate('GroupChatScreen', {
                                            item: chatItem
                                        })
                                    }
                                })
                            } else {
                                applyJoinModalRef.current?.open(group?.id ?? 0);
                            }
                        }} style={{
                            borderRadius: scale(15),
                            padding: scale(4),
                            backgroundColor: themeColor.primary
                        }} >
                            <Text style={{color: themeColor.textChoosed}}>{((group?.role ?? -1) > 0) ? "進入" : "加入"}</Text>
                        </Button>

                    </View>
                    <View style={{
                        marginTop: scale(12),
                        padding: scale(12),
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {
                            (groupMemberPage?.items ?? []).map(m => {
                                return <Image style={{
                                    width: scale(40),
                                    height: scale(40),
                                    borderRadius: scale(25),
                                    borderWidth: 1,
                                    borderColor: '#EAEDEF',
                                    marginLeft: scale(-15)
                                }} key={m.id} source={fileService.getFullUrl(m.avatar ?? '')} />
                            })
                        }
                        <Text style={{
                            marginLeft: scale(8),
                            fontSize: scale(14),
                            fontWeight: '400',
                        }}>{groupMemberPage?.total ?? 0}{t('groupChat.group_member_joined')}</Text>
                    </View>

                </View>
            </View>
            <ApplyJoinModal ref={applyJoinModalRef} />
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
});