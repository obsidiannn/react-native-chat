import { ColorsState, ThemeState } from "app/stores/system"

import { Platform, View } from "react-native"
import { useRecoilValue } from "recoil"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { s } from "app/utils/size"
import Navbar from "app/components/Navbar"
import { CardMenu } from "app/components/CardMenu/CardMenu"
import { ConfirmModal, ConfirmModalType } from "app/components/ConfirmModal"
import { useRef } from "react"
import { globalKV, globalStorage } from "app/utils/kv-tool"
import RNRestart from 'react-native-restart';
import messageSendService from "app/services/message-send.service"
import { useTranslation } from "react-i18next"
import toast from "app/utils/toast"
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { dump } from "app/utils/account"
import dayjs from "dayjs"
import { IconFont } from "app/components/IconFont/IconFont"
import { colors } from "app/theme"
export const SafetyScreen = () => {
    const insets = useSafeAreaInsets();
    const $colors = useRecoilValue(ColorsState);
    const $theme = useRecoilValue(ThemeState);
    const { t } = useTranslation('screens')
    const confirmModalRef = useRef<ConfirmModalType>(null);
    return <View style={{
        flex: 1,
        paddingTop: insets.top,
        backgroundColor: $colors.secondaryBackground,
    }}>
        <Navbar title="安全" />
        <View style={{
            marginTop: s(30),
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
                    icon: <IconFont name="docs" color={$colors.text} size={24} />,
                    title: "备份所有账户",
                    onPress: () => {
                        confirmModalRef.current?.open({
                            content: "是否备份所有账户？",
                            title: "备份所有账户",
                            onCancel: () => { },
                            onSubmit: async () => {
                                if (Platform.OS == "android") {
                                    const fileName = FileSystem.documentDirectory + `bobo_backup_${dayjs().format("YYYYmmdhms")}.txt`;
                                    await FileSystem.writeAsStringAsync(fileName, dump(), { encoding: FileSystem.EncodingType.UTF8 })
                                    if (!Sharing.isAvailableAsync()) {
                                        toast("不能分享")
                                    } else {
                                        Sharing.shareAsync(fileName)
                                    }
                                } else {
                                    const fileName = FileSystem.cacheDirectory + `bobo_backup_${dayjs().format("YYYYmmdhms")}.txt`;
                                    await FileSystem.writeAsStringAsync(fileName, dump(), { encoding: FileSystem.EncodingType.UTF8 })
                                    if (!Sharing.isAvailableAsync()) {
                                        toast("不能分享")
                                    } else {
                                        Sharing.shareAsync(fileName)
                                    }
                                }
                            }
                        })
                    },
                },
                {
                    icon: <IconFont name="quit" color={$colors.text} size={24} />,
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
                    icon: <IconFont name="trash" color={$colors.text} size={24} />,
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
                    icon: <IconFont name="userRemove" color={colors.palette.red500} size={24} />,
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
                    icon: <IconFont name="restart" color={colors.palette.red500} size={24} />,
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
    </View>
}

