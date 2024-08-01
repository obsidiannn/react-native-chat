import { forwardRef, useCallback, useContext, useImperativeHandle, useRef, useState } from "react";
import { GroupDetailItem, GroupMemberItemVO } from "@repo/types";
import BaseModal from "app/components/base-modal";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "app/utils/size";
import { useRecoilValue } from "recoil";
import { ColorsState, ThemeState } from "app/stores/system"
import AvatarX from "app/components/AvatarX";
import { GroupChatUiContext } from "../context";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import { colors } from "app/theme";
import { IModel } from "@repo/enums";
import {Icon} from "app/components/Icon/Icon";
import { isOnline } from "app/utils/account";
import { Button } from "app/components";
import groupApi from "app/api/group/group";
import GroupMemberManageModal, { GroupMemberManageModalType } from "./GroupMemberManageModal";
import SelectMemberModal, { SelectMemberModalType, SelectMemberOption } from "app/components/SelectMemberModal/Index"
import quickCrypto from "app/utils/quick-crypto";
import groupService from "app/services/group.service";
import friendService from "app/services/friend.service";
import AvatarUpload from "app/components/AvatarUpload";
import fileService from "app/services/file.service";

export interface GroupDetailModalType {
    open: () => void
}

export default forwardRef((_, ref) => {
    const [visible, setVisible] = useState(false);
    const themeColor = useRecoilValue(ColorsState)
    const groupContext = useContext(GroupChatUiContext)
    const [editing, setEditing] = useState(false)
    const [groupName, setGroupName] = useState(groupContext.group.name)
    const groupMemberManageRef = useRef<GroupMemberManageModalType>()
    const { t } = useTranslation('screens')
    const selectMemberModalRef = useRef<SelectMemberModalType>(null)
    const $theme = useRecoilValue(ThemeState);
    const onClose = () => {
        setVisible(false)
    }
    useImperativeHandle(ref, () => ({
        open: () => {
            setVisible(true);
        }
    }));

    const changeName = async () => {
        if (editing) {
            groupApi.changeName({ id: groupContext.group.id, name: groupName }).then(res => {
                groupContext.reloadGroup()
                setEditing(false)
            })
        } else {
            setEditing(true)
        }
    }


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
        groupService.invite(users, groupInfo).then(() => {
            groupContext.reloadMember()
        })
    }, []);




    return <BaseModal visible={visible} onClose={onClose} title={""} animationType="slide" styles={{
        flex: 1,
        backgroundColor: themeColor.secondaryBackground,
        paddingTop: scale(36),
    }}
        renderRight={
            <TouchableOpacity style={{ backgroundColor: themeColor.background, padding: scale(4), borderRadius: scale(8) }}
            >
                <Icon name={$theme === 'dark'? "shareDark":"shareLight"} />
            </TouchableOpacity>
        }

    >
        <View style={{
            flex: 1,
            borderTopLeftRadius: scale(24),
            borderTopRightRadius: scale(24),
            backgroundColor: themeColor.background,
            padding: scale(15),
            display: 'flex',
            flexDirection: 'column'
        }}>
            <View style={{
                marginTop: scale(-48)
            }}>
                {
                    groupContext.selfMember.role < IModel.IGroup.IGroupMemberRoleEnum.MEMBER ?
                        <AvatarUpload
                            border
                            avatar={fileService.getFullUrl(groupContext.group.avatar)}
                            onChange={(uri) => {
                                groupApi.changeAvatar({
                                    id: groupContext.group.id,
                                    avatar: uri
                                }).then(()=>{
                                    groupContext.reloadGroup()
                                })

                            }} /> :
                        <AvatarX uri={groupContext.group.avatar} border size={64} />
                }
            </View>
            <View style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: "space-between"
            }}>
                <TextInput
                    editable={editing && groupContext.selfMember && groupContext.selfMember.role < IModel.IGroup.IGroupMemberRoleEnum.MEMBER}
                    placeholder={t('groupCreate.placeholder_name')}
                    placeholderTextColor={colors.palette.gray300}
                    maxLength={128}
                    style={{
                        ...styles.input,
                        color: themeColor.text
                    }}
                    value={groupName}
                    cursorColor={themeColor.text}
                    onChangeText={text => {
                        if (text.length <= 10) {
                            setGroupName(text)
                        } else {
                            setGroupName(text.substring(0, 10))
                        }
                    }}
                />
                {groupContext.selfMember && groupContext.selfMember.role < IModel.IGroup.IGroupMemberRoleEnum.MEMBER ?
                    <TouchableOpacity style={{ backgroundColor: themeColor.secondaryBackground, padding: scale(4), borderRadius: scale(8) }}
                        onPress={changeName}
                    >
                        {editing ? <Icon name={$theme == "dark" ? "checkDark":"checkLight"} /> : <Icon name={$theme == "dark" ? "changeDark":"changeLight"}  />}
                    </TouchableOpacity> :
                    null
                }
            </View>
            <View style={{ marginBottom: scale(14) }}>
                <Text>{groupContext.group.desc}</Text>
            </View>
            <View style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: "space-between"
            }}>
                <View style={{
                    display: 'flex', flexDirection: 'row', alignItems: 'center',
                }}>
                    <Icon name={$theme == "dark" ? "peoplesDark":"peoplesLight"}  />
                    <Text>当前群成员人数</Text>
                </View>
                <Text>
                    {groupContext.members.length}/{groupContext.group.memberLimit}
                </Text>
            </View>

            <ScrollView>
                {
                    groupContext.members.map(item => {
                        return <View style={styles.memberItem} key={"member_" + item.id}>
                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <AvatarX uri={item.avatar} online={isOnline(1)} border />
                                <View>
                                    <Text style={{ color: themeColor.title, fontSize: scale(16), fontWeight: '500' }}>{item.a}</Text>
                                    <Text style={{ color: colors.palette.gray400 }}>{item.sign}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => {
                                groupMemberManageRef.current?.open(groupContext.group.id, item, groupContext.selfMember)
                            }}>
                                <Icon name={$theme == "dark" ? "moreDark":"moreLight"}  />
                            </TouchableOpacity>
                        </View>
                    })
                }

            </ScrollView>
            <Button style={{
                backgroundColor: themeColor.primary,
                borderRadius: scale(14),
            }}
                pressedStyle={{
                    backgroundColor: themeColor.btnChoosed
                }}
                onPress={async () => {
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
                }}
            >
                <Text style={{ color: themeColor.btnDefault }}>{t('groupChat.btn_invite_member')}</Text>
            </Button>
        </View>

        <SelectMemberModal ref={selectMemberModalRef} />
        <GroupMemberManageModal ref={groupMemberManageRef} />
    </BaseModal >
})


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    input: {
        fontSize: scale(32),
        fontWeight: '500',
        borderRadius: scale(12),
        marginVertical: scale(16)
    },
    switchLine: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: scale(12)
    },
    memberItem: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: scale(12)
    }
});
