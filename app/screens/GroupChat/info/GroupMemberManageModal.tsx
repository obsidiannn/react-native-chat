import BaseModal from "app/components/base-modal";
import { ColorsState } from "app/stores/system";
import { scale } from "app/utils/size";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRecoilValue } from "recoil";
import MenuItem from "./components/MenuItem";
import { useTranslation } from "react-i18next";
import Icon from "app/components/Icon";
import ConfirmModal, { ConfirmModalType } from "app/components/ConfirmModal";
import { GroupMemberItemVO } from "../../../../../../packages/types/dist/client/group";
import { IModel } from "@repo/enums";
import UserInfoModal, { UserInfoModalType } from "app/screens/UserInfo/UserInfoModal";


export interface GroupMemberManageModalType {
    open: (groupId: number, member: GroupMemberItemVO, selfMember: GroupMemberItemVO) => void;
}

export default forwardRef((_, ref) => {
    const [visible, setVisible] = useState(false)
    const themeColor = useRecoilValue(ColorsState)
    const confirmModalRef = useRef<ConfirmModalType>(null);
    const userInfoModalRef = useRef<UserInfoModalType>(null)

    const { t } = useTranslation('screens')
    const [member, setMember] = useState<GroupMemberItemVO | null>(null)
    const [self, setSelf] = useState<GroupMemberItemVO | null>(null)
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
            {/* 群信息 */}
            <MenuItem label={t('groupChat.btn_user_profile')}
                leftIcon={<Icon path={require('assets/icons/user-profile.svg')} width={16} height={20} />}
                rightComponent={<Icon path={require('assets/icons/arrow-right-gray.svg')} />}
                onPress={() => {
                    userInfoModalRef.current?.open(member?.uid ?? -1, self?.uid ?? 0)
                }}
            />
            {
                (self?.uid === member?.uid || (self?.role ?? IModel.IGroup.IGroupMemberRoleEnum.MEMBER) < IModel.IGroup.IGroupMemberRoleEnum.MEMBER) ?
                    <MenuItem label={t('groupChat.btn_change_alias')}
                        leftIcon={<Icon path={require('assets/icons/pencel.svg')} width={20} height={20} />}
                        onPress={() => {

                        }}
                    /> : null
            }


            <View style={{
                ...styles.bottomLine,
                borderBottomColor: themeColor.border
            }} />


            {
                ((self?.role ?? IModel.IGroup.IGroupMemberRoleEnum.MEMBER) < IModel.IGroup.IGroupMemberRoleEnum.MEMBER) ?
                    <>
                        <MenuItem label={t('groupChat.btn_kick_out')} labelColor="#FB3737"
                            onPress={() => {
                                confirmModalRef.current?.open({
                                    title: t('groupChat.btn_kick_out'),
                                    desc: t('groupChat.title_drop_message_desc'),
                                    onSubmit: () => {

                                    }
                                });
                            }}
                            leftIcon={<Icon path={require('assets/icons/remove.svg')} width={20} height={20} color="#FB3737" />}
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
                            leftIcon={<Icon path={require('assets/icons/block.svg')} width={20} height={20} color="#FB3737" />}
                        />
                    </> : null
            }


        </View>


        <UserInfoModal ref={userInfoModalRef} />
        <ConfirmModal ref={confirmModalRef} />
    </BaseModal>
})


const styles = StyleSheet.create({
    bottomLine: {
        borderBottomWidth: scale(0.5),
    }
})