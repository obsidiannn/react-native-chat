import { GroupDetailItem, GroupInfoItem, GroupMemberItemVO } from "@repo/types";
import { ScrollView, Text,View } from "react-native"
import { Button } from "app/components/Button"
import MemberItem from "./components/member-item";
import MenuItem from "./components/menu-item";
import QRcodeModal, { QRcodeModalRef } from "@/modals/screens/group-chat/qrcode-modal";
import ApplyListModal, { ApplyListModalRef } from "@/modals/screens/group-chat/apply-list-modal";
import ConfirmModal, { ConfirmModalType } from "@/modals/components/confirm-modal";
import GoodCategory, { GroupCategoryModalRef } from "@/modals/screens/group-chat/group-category";
import GoodManager, { GroupManagerModalRef } from "@/modals/screens/group-chat/group-manager";
import { useCallback, useContext, useRef } from "react";
import SelectMemberModal, { SelectMemberModalType, SelectMemberOption } from "@/modals/components/select-member-modal";
import groupService from "app/services/group.service";
import friendService from "app/services/friend.service";
import { GroupChatUiContext } from "../context";
import EventManager from 'app/services/event-manager.service'
import { useTranslation } from 'react-i18next';
import { IModel } from "@repo/enums";
export default (props: {
    group?: GroupDetailItem;
    authUser?: GroupMemberItemVO;
}) => {
    const qrcodeModalRef = useRef<QRcodeModalRef>(null);
    const applyListModalRef = useRef<ApplyListModalRef>(null);
    const confirmModalRef = useRef<ConfirmModalType>(null);
    const selectMemberModalRef = useRef<SelectMemberModalType>(null)
    const groupCategoryModalRef = useRef<GroupCategoryModalRef>(null)
    const groupManagerModalRef = useRef<GroupManagerModalRef>(null)
    const groupContext = useContext(GroupChatUiContext)
    const { t } = useTranslation('screen-group-chat')
    const batchInviteJoin = useCallback(async (users: {
        id: number;
        pubKey: string;
    }[]) => {

        const myWallet = globalThis.wallet
        if (!myWallet) {
            return
        }
        const author = props.authUser
        let sharedSecret: string
        if (author?.encPri !== '' && author?.encPri !== null && author?.encPri !== undefined) {
            console.log('a');
            const key = wallet?.computeSharedSecret(author.encPri)
            sharedSecret = quickAes.De(author.encKey, key ?? '')
        } else {
            console.log('b');
            const key = wallet?.computeSharedSecret(myWallet.getPublicKey())
            sharedSecret = quickAes.De(author?.encKey ?? '', key ?? '')
        }
        const groupPassword = quickAes.De(author?.encKey ?? '', sharedSecret)
        const groupInfo = {
            id: props.group?.id ?? -1,
            groupPassword: groupPassword
        }
        await groupService.invite(users, groupInfo);
    }, []);


    const renderAddMember = () => {
        return <MemberItem avatar={require('@/assets/icons/circle-plus-big-white.svg')} onPress={async () => {
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
                    title: t('title_add_member'),
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
        return <MemberItem avatar={require('@/assets/icons/circle-sub-big-white.svg')} onPress={() => {
            console.log('踢出用戶');
            if (groupContext.members) {
                const options: SelectMemberOption[] = groupContext.members.map((item) => {
                    const disabled = props.authUser?.id === item.id;
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
                    title: t('title_remove_member'),
                    options,
                    callback: (ops: SelectMemberOption[]) => {
                        console.log(ops);
                        const uids = ops.filter((item) => item.status).map(item => Number(item.id));
                        if (uids.length > 0) {
                            groupService.kickOut({
                                id: props.group?.id ?? -1,
                                uids,
                            }).then(() => {
                                toast(t('option_success'))
                            }).catch((e) => {
                                console.log(e);
                                toast(t('option_failed'))
                            })
                        }
                    },
                })
            }
        }} />
    }

    return <ScrollView style={{
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: scale(25),
    }}>
        <View style={{
            borderRadius: scale(16),
            borderWidth: 1,
            borderColor: '#F4F4F4',
            backgroundColor: '#F8F8F8',
            padding: scale(15),
            paddingRight: scale(0),
            paddingTop: scale(5),
            marginTop: scale(20),
        }}>
            <View style={{
                flexDirection: 'row',
                display: 'flex',
                flexWrap: 'wrap',
            }}>
                {(groupContext.members ?? []).map((member, i) => {
                    return <MemberItem key={member.id} avatar={member.avatar} text={member.name} onPress={() => {
                        console.log('點擊用戶', member);
                    }} />
                })}
                {/* 超管 + -  */}
                {(props.authUser && props.authUser.role < IModel.IGroup.IGroupMemberRoleEnum.MEMBER) ?
                    <>
                        {
                            //  renderAddMember()
                            renderRemoveMember()
                        }
                    </>
                    : null}

            </View>
        </View>
        <MenuItem onPress={() => {
            if (!props.group) {
                return;
            }
            qrcodeModalRef.current?.open({
                group: props.group,
                count: (groupContext.members ?? []).length
            })
        }} icon={require('@/assets/icons/qrcode.svg')} label={t('title_qrcode')} />
        <MenuItem label={t('title_limit')} rightComponent={<Text style={{
            fontSize: scale(14),
            fontWeight: '400',
            color: '#ABABB2',
        }}>100人</Text>} />




        {
            (props.authUser && props.authUser.role === IModel.IGroup.IGroupMemberRoleEnum.OWNER) ?
                <MenuItem onPress={() => {
                    if (!props.group) {
                        return;
                    }
                    groupCategoryModalRef.current?.open(props.group?.id);
                }} icon={require('@/assets/icons/arrow-right-gray.svg')} label={t('title_category')} />
                : null
        }


        {
            (props.authUser && props.authUser.role === IModel.IGroup.IGroupMemberRoleEnum.OWNER) ?
                <MenuItem onPress={() => {
                    if (!props.group) {
                        return;
                    }
                    console.log("管理進入");
                    groupManagerModalRef.current?.open(props.group?.id);
                }} icon={require('@/assets/icons/arrow-right-gray.svg')} label={t('title_manager')} />
                : null
        }

        {
            (props.authUser && props.authUser.role < IModel.IGroup.IGroupMemberRoleEnum.MEMBER) ?
                <>

                    <MenuItem onPress={() => {
                        if (!props.group) {
                            return;
                        }
                        applyListModalRef.current?.open(props.group?.id, props.authUser?.encKey ?? '', props.authUser?.encPri ?? '');
                    }} icon={require('@/assets/icons/arrow-right-gray.svg')} label={t('title_apply_list')} />
                    <MenuItem onPress={() => {
                        confirmModalRef.current?.open({
                            title: t('title_drop_message'),
                            desc: t('title_drop_message_desc'),
                            onSubmit: () => {
                                groupService.clearGroupMessages([groupContext.group.id], [groupContext.chatId]).then(() => {
                                    const event: ClearChatMessageEvent = { chatId: groupContext.chatId, type: IModel.IClient.SocketTypeEnum.CLEAR_ALL_MESSAGE }
                                    const eventKey = EventManager.generateChatTopic(groupContext.chatId)
                                    EventManager.emit(eventKey, event)
                                })
                            }
                        });
                    }} icon={require('@/assets/icons/arrow-right-gray.svg')} label={t('title_drop_message')} />


                </>
                : null
        }

        <MenuItem onPress={() => {
            confirmModalRef.current?.open({
                title: t('title_clear_message'),
                desc: t('title_drop_message_desc'),
                onSubmit: () => {
                    messageService.clearMineMessage([groupContext.chatId]).then(res => {
                        const event: ClearChatMessageEvent = { chatId: groupContext.chatId, type: IModel.IClient.SocketTypeEnum.CLEAR_ALL_MESSAGE }
                        const eventKey = EventManager.generateChatTopic(groupContext.chatId)
                        EventManager.emit(eventKey, event)
                        toast(t('option_success'))
                    })
                }
            });
        }} labelColor="#FB3737" icon={require('@/assets/icons/arrow-right-gray.svg')} label={t('title_clear_message')} />

        {
            (props.authUser && props.authUser.role === IModel.IGroup.IGroupMemberRoleEnum.OWNER) ?
                <Button onPress={() => {
                    confirmModalRef.current?.open({
                        title: t('title_drop_group'),
                        desc: t('title_drop_group_desc'),
                        onSubmit: () => {
                            console.log('解散羣聊');
                        }
                    });
                }} style={{
                    height: scale(50),
                    marginTop: scale(40),
                }} borderRadius={scale(12)} color="#FB3737" backgroundColor="white" outlineColor="#FB3737" label={t('title_drop_group')} />

                : null
        }

        <QRcodeModal ref={qrcodeModalRef} />
        <ApplyListModal onCheck={(item) => {
            console.log('查看用戶', item);
            // applyInfoModalRef.current?.open(item);
        }} ref={applyListModalRef} />
        <ConfirmModal ref={confirmModalRef} />
        <GoodCategory ref={groupCategoryModalRef} onCheck={() => {
            console.log("打開羣分類");
        }} />

        <GoodManager ref={groupManagerModalRef} onCheck={() => {
            console.log("打開羣管理");
        }} />


        <SelectMemberModal ref={selectMemberModalRef} />
    </ScrollView>
}
