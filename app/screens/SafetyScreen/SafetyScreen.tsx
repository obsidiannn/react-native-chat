import { ColorsState, ThemeState } from "app/stores/system"

import { Text, View } from "react-native"
import { useRecoilValue } from "recoil"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { s } from "app/utils/size"
import Navbar from "app/components/Navbar"
import { CardMenu } from "app/components/CardMenu/CardMenu"
import {ConfirmModal, ConfirmModalType } from "app/components/ConfirmModal"
import { useRef } from "react"
import { globalKV, globalStorage } from "app/utils/kv-tool"
import RNRestart from 'react-native-restart';
import messageSendService from "app/services/message-send.service"
import { useTranslation } from "react-i18next"
import toast from "app/utils/toast"
import { Icon } from "app/components/Icon/Icon"
import { BackupPriKeyModal, BackupPriKeyModalType } from "./BackupPriKeyModal"

export const SafetyScreen = () => {
    const insets = useSafeAreaInsets();
    const $colors = useRecoilValue(ColorsState);
    const $theme = useRecoilValue(ThemeState);
    const { t } = useTranslation('screens')
    const confirmModalRef = useRef<ConfirmModalType>(null);
    const backupPriKeyModalRef = useRef<BackupPriKeyModalType>(null);
    return <View style={{
        flex: 1,
        paddingTop: insets.top,
        backgroundColor: $colors.secondaryBackground,
    }}>
        <Navbar />
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
            <CardMenu items={[
                {
                    icon: <Icon name={$theme == "dark" ? "backupDark" : "backupLight"} />,
                    title: "备份所有",
                    onPress: () => {
                        backupPriKeyModalRef.current?.open()
                    },
                },
                {
                    icon: <Icon name={$theme == "dark" ? "quitDark" : "quitLight"} />,
                    title: "退出所有群聊",
                    onPress: () => {
                        confirmModalRef.current?.open({
                            content: "是否退出所有群聊？",
                            title: "退出所有群聊",
                            onCancel: () => { },
                            onSubmit: () => { }
                        })
                    },
                },
                {
                    icon: <Icon name={$theme == "dark" ? "trashDark" : "trashLight"} />,
                    title: "清空所有消息",
                    onPress: () => {
                        confirmModalRef.current?.open({
                            content: "是否清空所有消息？",
                            title: "清空所有消息",
                            onCancel: () => { },
                            onSubmit: async () => {
                                await messageSendService.clearMineMessageAll()
                                toast(t('success_operation'))
                            }
                        })
                    }
                },
            ]} />
            <CardMenu style={{
                marginTop: s(20),
            }} items={[
                {
                    icon:  <Icon name={$theme == "dark" ? "removeUserDark" : "removeUserRed"} />,
                    title: "删除所有好友",
                    textStyle: {
                        color: "#FB3737"
                    },
                    onPress: () => {
                        confirmModalRef.current?.open({
                            content: "是否删除所有好友？",
                            title: "删除所有好友",
                            onCancel: () => { },
                            onSubmit: () => {
                            }
                        })
                    },
                    rightArrow: null,
                },
                {
                    icon: <Icon name={$theme == "dark" ? "restartDark" : "restartRed"} />,
                    title: "重置应用",
                    textStyle: {
                        color: "#FB3737"
                    },
                    onPress: () => {
                        confirmModalRef.current?.open({
                            content: "是否重置应用？",
                            title: "重置应用",
                            onCancel: () => { },
                            onSubmit: () => {
                                globalStorage.flushAll();
                                globalKV.flushAll();
                                RNRestart.restart();
                            }
                        })
                    },
                    rightArrow: null,
                },
            ]} />
        </View>
        <ConfirmModal ref={confirmModalRef} />
        <BackupPriKeyModal ref={backupPriKeyModalRef}/>
    </View>
}

