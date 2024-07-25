import { ClearChatMessageEvent } from "@repo/types";
import { StyleSheet, Switch, Text, View } from "react-native"
import { Button } from "app/components/Button"
import MemberItem from "./components/MemberItem";
import MenuItem from "./components/MenuItem";
import QRcodeModal, { QRcodeModalRef } from "./QrcodeModal";
import ApplyListModal, { ApplyListModalRef } from "./ApplyListModal";
import ConfirmModal, { ConfirmModalType } from "app/components/ConfirmModal";
import GoodManager, { GroupManagerModalRef } from "./GroupManagerModal";
import { forwardRef, useCallback, useContext, useImperativeHandle, useMemo, useRef, useState } from "react";
import SelectMemberModal, { SelectMemberModalType, SelectMemberOption } from "app/components/SelectMemberModal/Index"
import groupService from "app/services/group.service";
import friendService from "app/services/friend.service";
import { GroupChatUiContext } from "../context";
import EventManager from 'app/services/event-manager.service'
import { useTranslation } from 'react-i18next';
import { IModel } from "@repo/enums";
import toast from "app/utils/toast";
import { scale } from "app/utils/size";
import messageSendService from "app/services/message-send.service";
import quickCrypto from "app/utils/quick-crypto";
import BaseModal from "app/components/base-modal";
import { useRecoilState, useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import Icon from "app/components/Icon";
import { colors } from "app/theme";
import { ScrollView } from "react-native-gesture-handler";
import GroupDetailModal, { GroupDetailModalType } from "./GroupDetailModal";
import { ChatsStore } from "app/stores/auth";

import chatApi from "app/api/chat/chat";
import group from "app/api/group/group";

export interface GroupInfoModalType {
    open: () => void
}

export default forwardRef((_, ref) => {

    const groupContext = useContext(GroupChatUiContext)
    const [visible, setVisible] = useState(false)
    const themeColor = useRecoilValue(ColorsState)

    const qrcodeModalRef = useRef<QRcodeModalRef>(null);
    const applyListModalRef = useRef<ApplyListModalRef>(null);
    const confirmModalRef = useRef<ConfirmModalType>(null);
    const selectMemberModalRef = useRef<SelectMemberModalType>(null)
    const groupDetailModalRef = useRef<GroupDetailModalType>(null)
    // const groupCategoryModalRef = useRef<GroupCategoryModalRef>(null)
    const groupManagerModalRef = useRef<GroupManagerModalRef>(null)
    const { t } = useTranslation('screens')

    // const [chatsStore, setChatsStore] = useRecoilState(ChatsStore)

    const chat = useMemo(() => {
        return groupContext.chatItem
    }, [
        groupContext.chatItem?.isTop,
        groupContext.chatItem?.isMute,
    ])



    const batchInviteJoin = useCallback(async (users: {
        id: number;
        pubKey: string;
    }[]) => {

        const myWallet = globalThis.wallet
        if (!myWallet) {
            return
        }
        const author = groupContext.selfMember
        if (!author) {
            return
        }
        let secretBuff
        if (author?.encPri !== '' && author?.encPri !== null && author?.encPri !== undefined) {
            console.log('a');
            const key = wallet?.computeSharedSecret(author.encPri)
            secretBuff = quickCrypto.De(key ?? '', Buffer.from(author.encKey, 'utf8'))
        } else {
            console.log('b');
            const key = wallet?.computeSharedSecret(myWallet.getPublicKey())
            // sharedSecret = quickAes.De(author?.encKey ?? '', key ?? '')
            secretBuff = quickCrypto.De(key ?? '', Buffer.from(author.encKey, 'utf8'))
        }
        const groupPassword = quickCrypto.De(author?.encKey ?? '', secretBuff)
        const groupInfo = {
            id: groupContext.group?.id ?? -1,
            groupPassword: Buffer.from(groupPassword).toString('hex')
        }
        await groupService.invite(users, groupInfo);
    }, []);


    const renderAddMember = () => {
        return <MemberItem avatar={require('assets/icons/plus.svg')} onPress={async () => {
            const data = await friendService.getOnlineList();
            const existIds = groupContext.members?.map(item => item.id) ?? [];
            const options: SelectMemberOption[] = data.map((item) => {
                const disabled = existIds.includes(item.id);
                return {
                    id: item.id,
                    icon: item.avatar,
                    status: false,
                    name: item.nickName,
                    title: item.nickName,
                    name_index: item.nickNameIdx,
                    disabled,
                    pubKey: item.pubKey
                } as SelectMemberOption;
            })
            if (options.length > 0) {
                console.log('options', options);
                selectMemberModalRef.current?.open({
                    title: t('groupChat.title_add_member'),
                    options,
                    callback: async (ops: SelectMemberOption[]) => {
                        const selected = ops.filter((item) => item.status).map(o => {
                            return { id: Number(o.id), pubKey: o.pubKey ?? '' }
                        })
                        if (selected.length > 0) {
                            await batchInviteJoin(selected)
                        }
                    },
                })
            }
        }} />
    }

    const renderRemoveMember = () => {
        return <MemberItem avatar={require('assets/icons/plus.svg')} onPress={() => {
            console.log('踢出用戶');
            if (groupContext.members) {
                const options: SelectMemberOption[] = groupContext.members.map((item) => {
                    const disabled = groupContext.selfMember?.id === item.id;
                    return {
                        id: item.id,
                        icon: item.avatar,
                        status: false,
                        name: item.name,
                        title: item.name,
                        name_index: item.nameIndex,
                        disabled,
                        pubKey: item.pubKey
                    } as SelectMemberOption;
                })

                selectMemberModalRef.current?.open({
                    title: t('groupChat.title_remove_member'),
                    options,
                    callback: (ops: SelectMemberOption[]) => {
                        console.log(ops);
                        const uids = ops.filter((item) => item.status).map(item => Number(item.id));
                        if (uids.length > 0) {
                            groupService.kickOut({
                                id: groupContext.group?.id ?? -1,
                                uids,
                            }).then(() => {
                                toast(t('groupChat.option_success'))
                            }).catch((e) => {
                                console.log(e);
                                toast(t('groupChat.option_failed'))
                            })
                        }
                    },
                })
            }
        }} />
    }


    const changeTop = (chatIdVal: string, val: number) => {
        groupContext.reloadChat({
            ...groupContext.chatItem,
            isTop: val
        })
    }

    const changeMute = (chatIdVal: string, val: number) => {
        groupContext.reloadChat({
            ...groupContext.chatItem,
            isMute: val
        })
    }


    useImperativeHandle(ref, () => ({
        open: () => {
            setVisible(true)
        }
    }));


    return <BaseModal visible={visible} onClose={() => { setVisible(false) }} title="群设置" styles={{
        backgroundColor: themeColor.secondaryBackground,
        paddingTop: scale(24),
        flex: 1
    }}>
        <ScrollView style={{
            flex: 1,
            borderTopLeftRadius: scale(24),
            borderTopRightRadius: scale(24),
            backgroundColor: themeColor.background,
            padding: scale(15),
        }}>
            {/* 群信息 */}
            <MenuItem label={t('groupChat.title_group_info')}
                leftIcon={<Icon path={require('assets/icons/group-info.svg')} width={16} height={20} />}
                rightComponent={<Icon path={require('assets/icons/arrow-right-gray.svg')} />}
                onPress={() => {
                    groupDetailModalRef.current?.open()
                }}
            />
            {
                // 管理员
                (groupContext.selfMember && groupContext.selfMember.role === IModel.IGroup.IGroupMemberRoleEnum.OWNER) ?
                    <MenuItem label={t('groupChat.title_manager')}
                        onPress={() => {
                            if (!groupContext.group) {
                                return;
                            }
                            console.log("管理進入");
                            groupManagerModalRef.current?.open(groupContext.group?.id);
                        }}
                        leftIcon={<Icon path={require('assets/icons/group-manager.svg')} width={16} height={20} />}
                        rightComponent={<Icon path={require('assets/icons/arrow-right-gray.svg')} />} />
                    : null
            }
            <View style={{
                ...styles.bottomLine,
                borderBottomColor: themeColor.border
            }} />

            <MenuItem label={t('groupChat.title_top')}
                leftIcon={<Icon path={require('assets/icons/top.svg')} width={16} height={16} />}
                rightComponent={<Switch value={chat?.isTop === IModel.ICommon.ICommonBoolEnum.YES}
                    thumbColor={'#ffffff'}
                    trackColor={{
                        false: colors.palette.gray400,
                        true: themeColor.primary
                    }}
                    onValueChange={async (e) => {
                        const res = await chatApi.raiseTop({
                            chatUserId: groupContext.chatItem.chatUserId ?? '',
                            top: e
                        })
                        changeTop(groupContext.chatItem.id, res.isTop)

                    }} />} />

            <MenuItem label={t('groupChat.title_inhibite')}
                leftIcon={<Icon path={require('assets/icons/ignore.svg')} width={16} height={16} />}
                rightComponent={<Switch value={chat?.isMute === IModel.ICommon.ICommonBoolEnum.YES}
                    thumbColor={'#ffffff'}
                    trackColor={{
                        false: colors.palette.gray400,
                        true: themeColor.primary
                    }}
                    onValueChange={async (e) => {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        changeMute(groupContext.chatItem.id, e ? 1 : 0)
                    }} />} />

            <View style={{
                ...styles.bottomLine,
                borderBottomColor: themeColor.border
            }} />

            {
                (groupContext.selfMember && groupContext.selfMember.role < IModel.IGroup.IGroupMemberRoleEnum.MEMBER) ?
                    <>
                        {/* 申请列表 */}
                        <MenuItem onPress={() => {
                            if (!groupContext.group) {
                                return;
                            }
                            applyListModalRef.current?.open(groupContext.group?.gid, groupContext.selfMember?.encKey ?? '', groupContext.selfMember?.encPri ?? '');
                        }} icon={require('assets/icons/arrow-right-gray.svg')} label={t('groupChat.title_apply_list')} />
                        {/* 清空群记录 */}
                        <MenuItem label={t('groupChat.title_drop_message')} labelColor="#FB3737"
                            onPress={() => {
                                confirmModalRef.current?.open({
                                    title: t('groupChat.title_drop_message'),
                                    desc: t('groupChat.title_drop_message_desc'),
                                    onSubmit: () => {
                                        groupService.clearGroupMessages([groupContext.group.id], [groupContext.group?.chatId]).then(() => {
                                            const event: ClearChatMessageEvent = { chatId: groupContext.group.chatId, type: IModel.IClient.SocketTypeEnum.CLEAR_ALL_MESSAGE }
                                            const eventKey = EventManager.generateChatTopic(groupContext.group.chatId)
                                            EventManager.emit(eventKey, event)
                                        })
                                    }
                                });
                            }}
                            leftIcon={<Icon path={require('assets/icons/ignore.svg')} width={16} height={16} color="#FB3737" />}
                        />
                    </>
                    : null
            }

            <MenuItem label={t('groupChat.title_clear_message')} labelColor="#FB3737"
                onPress={() => {
                    confirmModalRef.current?.open({
                        title: t('groupChat.title_clear_message'),
                        desc: t('groupChat.title_drop_message_desc'),
                        onSubmit: () => {
                            groupService.clearGroupMessages([groupContext.group.id], [groupContext.group?.chatId]).then(() => {
                                const event: ClearChatMessageEvent = { chatId: groupContext.group.chatId, type: IModel.IClient.SocketTypeEnum.CLEAR_ALL_MESSAGE }
                                const eventKey = EventManager.generateChatTopic(groupContext.group.chatId)
                                EventManager.emit(eventKey, event)
                            })
                        }
                    });
                }}
                leftIcon={<Icon path={require('assets/icons/ignore.svg')} width={16} height={16} color="#FB3737" />}
            />

            {
                (groupContext.selfMember && groupContext.selfMember.role !== IModel.IGroup.IGroupMemberRoleEnum.OWNER) ?
                    <MenuItem label={t('groupChat.title_exit_group')} labelColor="#FB3737"
                        onPress={() => {
                            confirmModalRef.current?.open({
                                title: t('groupChat.title_clear_message'),
                                desc: t('groupChat.title_drop_message_desc'),
                                onSubmit: () => {
                                    messageSendService.clearMineMessage([groupContext.group.chatId]).then(res => {
                                        const event: ClearChatMessageEvent = { chatId: groupContext.group.chatId, type: IModel.IClient.SocketTypeEnum.CLEAR_ALL_MESSAGE }
                                        const eventKey = EventManager.generateChatTopic(groupContext.group.chatId)
                                        EventManager.emit(eventKey, event)
                                        toast(t('groupChat.option_success'))
                                    })
                                }
                            });
                        }}
                        leftIcon={<Icon path={require('assets/icons/delete.svg')} width={20} height={20} color="#FB3737" />}
                    /> : null
            }

            {
                (groupContext.selfMember && groupContext.selfMember.role === IModel.IGroup.IGroupMemberRoleEnum.OWNER) ?
                    <Button onPress={() => {
                        confirmModalRef.current?.open({
                            title: t('groupChat.title_drop_group'),
                            desc: t('groupChat.title_drop_group_desc'),
                            onSubmit: () => {
                                console.log('解散羣聊');
                            }
                        });
                    }} style={{
                        height: scale(50),
                        marginVertical: scale(24),
                        borderRadius: scale(12)
                    }} >
                        <Text>{t('groupChat.title_drop_group')}</Text>
                    </Button>

                    : null
            }

        </ScrollView>





        {/* {
            (props.authUser && props.authUser.role === IModel.IGroup.IGroupMemberRoleEnum.OWNER) ?
                <MenuItem onPress={() => {
                    if (!props.group) {
                        return;
                    }
                    groupCategoryModalRef.current?.open(props.group?.id);
                }} icon={require('@/assets/icons/arrow-right-gray.svg')} label={t('groupChat.title_category')} />
                : null
        } */}




        <QRcodeModal ref={qrcodeModalRef} />
        <ApplyListModal onCheck={(item) => {
            console.log('查看用戶', item);
            // applyInfoModalRef.current?.open(item);
        }} ref={applyListModalRef} />
        <ConfirmModal ref={confirmModalRef} />
        {/* <GoodCategory ref={groupCategoryModalRef} onCheck={() => {
            console.log("打開羣分類");
        }} /> */}

        <GoodManager ref={groupManagerModalRef} onCheck={() => {
            console.log("打開羣管理");
        }} />
        <GroupDetailModal ref={groupDetailModalRef} />

        <SelectMemberModal ref={selectMemberModalRef} />
    </BaseModal>
})


const styles = StyleSheet.create({
    bottomLine: {
        borderBottomWidth: scale(0.5),
    }
})