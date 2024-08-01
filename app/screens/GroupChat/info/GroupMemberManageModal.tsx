import BaseModal from "app/components/base-modal";
import { ColorsState, ThemeState } from "app/stores/system"
import { scale } from "app/utils/size";
import { forwardRef, useContext, useImperativeHandle, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRecoilValue } from "recoil";
import MenuItem from "./components/MenuItem";
import { useTranslation } from "react-i18next";
import { Icon } from "app/components/Icon/Icon";
import ConfirmModal, { ConfirmModalType } from "app/components/ConfirmModal";
import { GroupMemberItemVO } from "../../../../../../packages/types/dist/client/group";
import { IModel } from "@repo/enums";
import UserInfoModal, { UserInfoModalType } from "app/screens/UserInfo/UserInfoModal";
import ConfirmInputModal, { ConfirmInputModalType } from "app/components/ConfirmInputModal";
import groupApi from "app/api/group/group";
import { GroupChatUiContext } from "../context";
import groupService from "app/services/group.service";


export interface GroupMemberManageModalType {
    open: (groupId: number, member: GroupMemberItemVO, selfMember: GroupMemberItemVO) => void;
}

export default forwardRef((_, ref) => {
    const [visible, setVisible] = useState(false)
    const themeColor = useRecoilValue(ColorsState)
    const confirmModalRef = useRef<ConfirmModalType>(null);
    const confirmInputModalRef = useRef<ConfirmInputModalType>(null);
    const userInfoModalRef = useRef<UserInfoModalType>(null)
    const groupContext = useContext(GroupChatUiContext)
    const { t } = useTranslation('screens')
    const [member, setMember] = useState<GroupMemberItemVO | null>(null)
    const [self, setSelf] = useState<GroupMemberItemVO | null>(null)

    const $theme = useRecoilValue(ThemeState);

    const onClose = () => {
        setMember(null)
        setSelf(null)
        setVisible(false)
    }

    useImperativeHandle(ref, () => ({
        open: (groupId: number, member: GroupMemberItemVO, selfMember: GroupMemberItemVO) => {
            setMember(member)
            setSelf(selfMember)
            setVisible(true);
        }
    }));

    return <BaseModal visible={visible} onClose={onClose} title="群设置" styles={{
        backgroundColor: themeColor.secondaryBackground,
        paddingTop: scale(24),
        flex: 1
    }}>
        <View style={{
            flex: 1,
            borderTopLeftRadius: scale(24),
            borderTopRightRadius: scale(24),
            backgroundColor: themeColor.background,
            padding: scale(15),
        }}>
            {/* 查看个人资料 */}
            <MenuItem label={t('groupChat.btn_user_profile')}
                leftIcon={<Icon name={$theme === 'dark'?"profileDark":"profileLight"} />}
                rightComponent={<Icon name={"arrowRight"} />}
                onPress={() => {
                    userInfoModalRef.current?.open(member?.uid ?? -1, self?.uid ?? 0)
                }}
            />
            {
                // 添加群备注
                (self?.uid === member?.uid || (self?.role ?? IModel.IGroup.IGroupMemberRoleEnum.MEMBER) < IModel.IGroup.IGroupMemberRoleEnum.MEMBER) ?
                    <MenuItem label={t('groupChat.btn_change_alias')}
                        leftIcon={<Icon name={$theme === 'dark'?"editDark":"editLight"} />}
                        onPress={() => {
                            confirmInputModalRef.current?.open({
                                title: t('groupChat.btn_change_alias'),
                                desc: '',
                                defaultVal: member?.a,
                                onSubmit: (val: string) => {
                                    if (self?.uid === member?.uid) {
                                        groupApi.changeAlias({ id: member?.groupId, alias: val }).then(res => {
                                            const temp = {
                                                ...member,
                                                a: val
                                            }
                                            setMember(temp)
                                            groupContext.reloadMemberByUids([member?.uid ?? 0])
                                        })
                                    } else {
                                        groupApi.changeAliasByManager({ id: member?.groupId ?? 0, uid: member?.uid ?? 0, alias: val }).then(res => {
                                            const temp = {
                                                ...member,
                                                a: val
                                            }
                                            setMember(temp)
                                            groupContext.reloadMemberByUids([member?.uid ?? 0])
                                        })
                                    }
                                }
                            });
                        }}
                    /> : null
            }




            {
                ((self?.role ?? IModel.IGroup.IGroupMemberRoleEnum.MEMBER) < IModel.IGroup.IGroupMemberRoleEnum.MEMBER) && self?.uid !== member?.uid ?
                    <>
                        <View style={{
                            ...styles.bottomLine,
                            borderBottomColor: themeColor.border
                        }} />
                        <MenuItem label={t('groupChat.btn_kick_out')} labelColor="#FB3737"
                            onPress={() => {
                                confirmModalRef.current?.open({
                                    title: t('groupChat.btn_kick_out'),
                                    desc: t('groupChat.title_drop_message_desc'),
                                    onSubmit: () => {
                                        groupService.kickOut({
                                            id: member?.groupId ?? 0,
                                            uids: [member?.uid ?? 0]
                                        })
                                    }
                                });
                            }}
                            leftIcon={<Icon name={$theme ==='dark'?"trashDark":"trashLight"} />}
                        />
                        <MenuItem label={t('groupChat.btn_block_user')} labelColor="#FB3737"
                            onPress={() => {
                                confirmModalRef.current?.open({
                                    title: t('groupChat.btn_block_user'),
                                    desc: t('groupChat.title_drop_message_desc'),
                                    onSubmit: () => {

                                    }
                                });
                            }}
                            leftIcon={<Icon name={"blockRed"}/>}
                        />
                    </> : null
            }


        </View>


        <UserInfoModal ref={userInfoModalRef} />
        <ConfirmModal ref={confirmModalRef} />
        <ConfirmInputModal ref={confirmInputModalRef} />
    </BaseModal>
})


const styles = StyleSheet.create({
    bottomLine: {
        borderBottomWidth: scale(0.5),
    }
})
