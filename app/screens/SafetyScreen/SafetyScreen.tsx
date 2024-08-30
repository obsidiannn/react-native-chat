import { ColorsState, ThemeState } from "app/stores/system"

import { Platform, View } from "react-native"
import { useRecoilValue } from "recoil"
import { s } from "app/utils/size"
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
import { ScreenX } from "app/components/ScreenX"
export const SafetyScreen = () => {
    const $colors = useRecoilValue(ColorsState);
    const { t } = useTranslation('default')
    const confirmModalRef = useRef<ConfirmModalType>(null);
    const $theme = useRecoilValue(ThemeState);
    return <ScreenX title={t('Safety')} theme={$theme}>
        <View style={{
            paddingHorizontal:s(15),
            paddingTop:s(20)
        }}>
        <CardMenu theme={$theme} items={[
            {
                icon: <IconFont name="docs" color={$colors.text} size={24} />,
                title: t('Backup All Accounts'),
                onPress: () => {
                    confirmModalRef.current?.open({
                        content: t('Are you sure to backup all accounts?'),
                        title: t('Backup All Accounts'),
                        onCancel: () => { },
                        onSubmit: async () => {
                            if (Platform.OS == "android") {
                                const fileName = FileSystem.documentDirectory + `bobo_backup_${dayjs().format("YYYYmmdhms")}.txt`;
                                await FileSystem.writeAsStringAsync(fileName, dump(), { encoding: FileSystem.EncodingType.UTF8 })
                                if (!Sharing.isAvailableAsync()) {
                                    toast(t('Can not share'))
                                } else {
                                    Sharing.shareAsync(fileName)
                                }
                            } else {
                                const fileName = FileSystem.cacheDirectory + `bobo_backup_${dayjs().format("YYYYmmdhms")}.txt`;
                                await FileSystem.writeAsStringAsync(fileName, dump(), { encoding: FileSystem.EncodingType.UTF8 })
                                if (!Sharing.isAvailableAsync()) {
                                    toast(t('Can not share'))
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
                title: t('Exit All Group'),
                onPress: () => {
                    confirmModalRef.current?.open({
                        content: t('Are you sure to exit all groups?'),
                        title: t('Exit All Group'),
                        onCancel: () => { },
                        onSubmit: async () => { }
                    })
                },
            },
            {
                icon: <IconFont name="trash" color={$colors.text} size={24} />,
                title: t('Clear All Messages'),
                onPress: () => {
                    confirmModalRef.current?.open({
                        content: t("Are you sure to clear all messages?"),
                        title: t('Clear All Messages'),
                        onCancel: () => { },
                        onSubmit: async () => {
                            await messageSendService.clearMineMessageAll()
                            toast(t('Operation success'))
                        }
                    })
                }
            },
        ]} />
        <CardMenu theme={$theme} style={{
            marginTop: s(20),
        }} items={[
            {
                icon: <IconFont name="userRemove" color={colors.palette.red500} size={24} />,
                title: t('Delete All Friends'),
                textStyle: {
                    color: "#FB3737"
                },
                onPress: () => {
                    confirmModalRef.current?.open({
                        content: t('Are you sure to delete all friends?'),
                        title: t('Delete All Friends'),
                        onCancel: () => { },
                        onSubmit: async() => {
                        }
                    })
                },
                rightArrow: null,
            },
            {
                icon: <IconFont name="restart" color={colors.palette.red500} size={24} />,
                title: t("Reset App"),
                textStyle: {
                    color: "#FB3737"
                },
                onPress: () => {
                    confirmModalRef.current?.open({
                        content: "Are you sure to reset app?",
                        title: t("Reset App"),
                        onCancel: () => { },
                        onSubmit: async () => {
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
        <ConfirmModal theme={$theme} ref={confirmModalRef} />
    </ScreenX>
}

