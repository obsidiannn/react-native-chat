import { forwardRef, useContext, useImperativeHandle, useState } from "react";
import { GroupDetailItem, GroupMemberItemVO } from "@repo/types";
import BaseModal from "app/components/base-modal";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "app/utils/size";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import { Avatar } from "app/components/chat-ui";
import AvatarX from "app/components/AvatarX";
import { GroupChatUiContext } from "../context";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import { colors } from "app/theme";
import { IModel } from "@repo/enums";
import Icon from "app/components/Icon";
import { isOnline } from "app/utils/account";
import { Button } from "app/components";


export interface GroupDetailModalType {
    open: () => void
}

export default forwardRef((_, ref) => {
    const [visible, setVisible] = useState(false);
    const themeColor = useRecoilValue(ColorsState)
    const groupContext = useContext(GroupChatUiContext)
    const [editing, setEditing] = useState(false)

    const { t } = useTranslation('screens')

    const onClose = () => {
        setVisible(false)
    }
    useImperativeHandle(ref, () => ({
        open: () => {
            setVisible(true);
        }
    }));

    return <BaseModal visible={visible} onClose={onClose} title={""} animationType="slide" styles={{
        flex: 1,
        backgroundColor: themeColor.secondaryBackground,
        paddingTop: scale(36),
    }} >
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
                <AvatarX uri={groupContext.group.avatar} border size={64} />
            </View>
            <View style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: "space-between"
            }}>
                <TextInput
                    enabled={editing && groupContext.selfMember && groupContext.selfMember.role < IModel.IGroup.IGroupMemberRoleEnum.MEMBER}
                    placeholder={t('groupCreate.placeholder_name')}
                    placeholderTextColor={colors.palette.gray300}
                    maxLength={128}
                    style={{
                        ...styles.input,
                    }}
                    value={groupContext.group?.name}
                    cursorColor={themeColor.text}
                    onChangeText={text => {

                    }}
                />
                {groupContext.selfMember && groupContext.selfMember.role < IModel.IGroup.IGroupMemberRoleEnum.MEMBER ?
                    <TouchableOpacity style={{ backgroundColor: themeColor.secondaryBackground, padding: scale(4), borderRadius: scale(8) }}>
                        {editing ? <Icon path={require("assets/icons/edit.svg")} /> : <Icon path={require("assets/icons/edit.svg")} />}
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
                    <Icon path={require("assets/icons/group-info.svg")} />
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
                            <TouchableOpacity>
                                <Icon path={require("assets/icons/more.svg")} />
                            </TouchableOpacity>
                        </View>
                    })
                }

            </ScrollView>
            <Button style={{
                backgroundColor: themeColor.primary,
                borderRadius: scale(14),
            }}>
                <Text style={{ color: themeColor.btnDefault }}>{t('groupChat.btn_invite_member')}</Text>
            </Button>
        </View>

    </BaseModal>
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
