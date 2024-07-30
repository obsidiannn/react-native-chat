import { ColorsState, ThemeState } from "app/stores/system"

import { StyleSheet, Text, View } from "react-native"
import { useRecoilValue } from "recoil"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { s } from "app/utils/size"
import { CardMenu } from "app/components/CardMenu/CardMenu"
import { forwardRef, useImperativeHandle, useRef, useState } from "react"
import BaseModal from "app/components/base-modal"
import { useTranslation } from "react-i18next"
import ConfirmModal, { ConfirmModalType } from "app/components/ConfirmModal"
import messageSendService from "app/services/message-send.service"
import toast from "app/utils/toast"
import { FormLine } from "app/components/FormLine"
import Icon from "app/components/Icon"


export interface SafetyModalType {
    open: () => void
}


export default forwardRef((_, ref) => {
    const insets = useSafeAreaInsets();
    const $colors = useRecoilValue(ColorsState);
    const $theme = useRecoilValue(ThemeState);
    const themeColor = useRecoilValue(ColorsState)
    const [visible, setVisible] = useState(false)

    const { t } = useTranslation('screens')


    const confirmModalRef = useRef<ConfirmModalType>(null);

    const onClose = () => {
        setVisible(false)
    }

    useImperativeHandle(ref, () => ({
        open: () => {
            setVisible(true);
        }
    }));

    return <BaseModal title="" visible={visible} onClose={onClose} styles={{
        flex: 1,
        backgroundColor: themeColor.background
    }} >

        <View style={{
            flex: 1,
            paddingTop: insets.top,
            backgroundColor: $colors.secondaryBackground,
        }}>
            <Text style={{
                color: $colors.text,
                fontSize: s(26),
                fontWeight: "600",
                marginTop: s(10),
                marginLeft: s(10),
                marginVertical: s(30)
            }}>安全</Text>
            <View style={{
                flex: 1,
                backgroundColor: "white",
                width: s(375),
                borderTopRightRadius: s(32),
                borderTopLeftRadius: s(32),
                paddingHorizontal: s(16),
                paddingTop: s(30)
            }}>

                <FormLine onPress={() => { }}
                    title={"备份助记词"}
                    renderLeft={
                        <Icon color={themeColor.text} path={require('assets/icons/backup.svg')} />
                    }
                    renderRight={
                        <View style={styles.formLine} >
                            <Icon color={themeColor.secondaryText} path={require('assets/icons/arrow-right-gray.svg')} />
                        </View>
                    }
                />
                <FormLine onPress={() => { }}
                    title={"退出所有群聊"}
                    renderLeft={
                        <Icon color={themeColor.text} path={require('assets/icons/quit.svg')} />
                    }
                    renderRight={
                        <View style={styles.formLine} >
                            <Icon color={themeColor.secondaryText} path={require('assets/icons/arrow-right-gray.svg')} />
                        </View>
                    }
                />
                <FormLine onPress={() => {
                    confirmModalRef.current?.open({
                        title: t('btn_clear_message_all'),
                        desc: t('btn_clear_message_all_desc'),
                        onSubmit: async () => {
                            await messageSendService.clearMineMessageAll()
                            toast(t('success_operation'))
                        }
                    })
                }}
                    title={"清空所有消息"}
                    renderLeft={
                        <Icon color={themeColor.text} path={require('assets/icons/delete.svg')} />
                    }
                    renderRight={
                        <View style={styles.formLine} >
                            <Icon color={themeColor.secondaryText} path={require('assets/icons/arrow-right-gray.svg')} />
                        </View>
                    }
                />
            </View>

            <View style={{
                flex: 1,
                backgroundColor: "white",
                width: s(375),
                borderTopRightRadius: s(32),
                borderTopLeftRadius: s(32),
                paddingHorizontal: s(16),
                paddingTop: s(30)
            }}>

                <FormLine onPress={() => { }}
                    title={"备份助记词"}
                    renderLeft={
                        <Icon color={themeColor.text} path={require('assets/icons/backup.svg')} />
                    }
                    renderRight={
                        <View style={styles.formLine} >
                            <Icon color={themeColor.secondaryText} path={require('assets/icons/arrow-right-gray.svg')} />
                        </View>
                    }
                />
                <FormLine onPress={() => { }}
                    title={"退出所有群聊"}
                    renderLeft={
                        <Icon color={themeColor.text} path={require('assets/icons/quit.svg')} />
                    }
                    renderRight={
                        <View style={styles.formLine} >
                            <Icon color={themeColor.secondaryText} path={require('assets/icons/arrow-right-gray.svg')} />
                        </View>
                    }
                />
                <FormLine onPress={() => {
                    confirmModalRef.current?.open({
                        title: t('btn_clear_message_all'),
                        desc: t('btn_clear_message_all_desc'),
                        onSubmit: async () => {
                            await messageSendService.clearMineMessageAll()
                            toast(t('success_operation'))
                        }
                    })
                }}
                    title={"清空所有消息"}
                    renderLeft={
                        <Icon color={themeColor.text} path={require('assets/icons/delete.svg')} />
                    }
                    renderRight={
                        <View style={styles.formLine} >
                            <Icon color={themeColor.secondaryText} path={require('assets/icons/arrow-right-gray.svg')} />
                        </View>
                    }
                />


                <FormLine onPress={() => { }}
                    title={"删除所有好友"}
                    renderLeft={
                        <Icon color={themeColor.text} path={require('assets/icons/user-delete.svg')} />
                    }
                    renderRight={
                        <View style={styles.formLine} >
                            <Icon color={themeColor.secondaryText} path={require('assets/icons/arrow-right-gray.svg')} />
                        </View>
                    }
                />
                <FormLine onPress={() => { }}
                    title={"重置应用"}
                    renderLeft={
                        <Icon color={themeColor.text} path={require('assets/icons/reset.svg')} />
                    }
                    renderRight={
                        <View style={styles.formLine} >
                            <Icon color={themeColor.secondaryText} path={require('assets/icons/arrow-right-gray.svg')} />
                        </View>
                    }
                />

            </View>

        </View>
        <ConfirmModal ref={confirmModalRef} />

    </BaseModal>
})


const styles = StyleSheet.create({
    formLine: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    }
})