import { ColorsState, ThemeState } from "app/stores/system"

import { Text, View } from "react-native"
import { useRecoilValue } from "recoil"
import { s } from "app/utils/size"
import { CardMenu } from "app/components/CardMenu/CardMenu"
import { ConfirmModal, ConfirmModalType } from "app/components/ConfirmModal"
import { useRef } from "react"
import { quit } from "app/utils/account"
import { navigate } from "app/navigators"
import { App } from "types/app"
import { StackScreenProps } from "@react-navigation/stack"
import { LangModal, LangModalType } from "./LangModal"
import { UpgradeModal, UpgradeModalType } from "./UpgradeModal"
import * as Application from 'expo-application';
import { IconFont } from "app/components/IconFont/IconFont"
import { colors } from "app/theme"
import { ScreenX } from "app/components/ScreenX"
import { useTranslation } from "react-i18next"
type Props = StackScreenProps<App.StackParamList, 'SettingScreen'>;
export const SettingScreen = ({ navigation }: Props) => {
    const $colors = useRecoilValue(ColorsState);
    const $theme = useRecoilValue(ThemeState);
    const confirmModalRef = useRef<ConfirmModalType>(null);
    const langModalRef = useRef<LangModalType>(null);
    const upgradeModalRef = useRef<UpgradeModalType>(null);
    const version = Application.nativeApplicationVersion;
    const {t} = useTranslation('default');
    return <ScreenX theme={$theme} title={t('Setting')}>
        <View style={{
            paddingHorizontal: s(15),
            paddingTop:s(20)
        }}>
            <CardMenu theme={$theme} items={[
                {
                    icon: <IconFont name="about" color={$colors.text} size={24} />,
                    title: t('About Us'),
                    onPress: () => {
                        navigate("WebViewScreen", {
                            title: t('About Us'),
                            url: "https://www.baidu.com"
                        })
                    }
                },
                {
                    icon: <IconFont name="language" color={$colors.text} size={24} />,
                    title: t('Language'),
                    onPress: () => {
                        langModalRef.current?.open()
                    }
                },
                {
                    icon: <IconFont name="book" color={$colors.text} size={24} />,
                    title: t('Current Version'),
                    onPress: () => {
                        upgradeModalRef.current?.open()
                    },
                    rightArrow: <View style={{
                        flexDirection: "row",
                        alignItems: "center"
                    }}>
                        <Text style={{
                            color: $colors.secondaryText
                        }}>{version}</Text>
                        <IconFont name="arrowRight" color={$colors.border} size={14} />
                    </View>
                },
                {
                    icon: <IconFont name="userRemove" color={$colors.text} size={24} />,
                    title: t('Blacklist'),
                    onPress: () => {
                        navigate('UserBlockScreen')
                    },
                    rightArrow: <View style={{
                        flexDirection: "row",
                        alignItems: "center"
                    }}>
                        <IconFont name="arrowRight" color={$colors.border} size={14} />
                    </View>
                },

                {
                    icon: <IconFont name="doc" color={$colors.text} size={24} />,
                    title: t('System Feedback'),
                    onPress: () => {
                        navigate('SystemFeedbackScreen')
                    },
                    rightArrow: <View style={{
                        flexDirection: "row",
                        alignItems: "center"
                    }}>
                        <IconFont name="arrowRight" color={$colors.border} size={14} />
                    </View>
                },
                {
                    icon: <IconFont name="doc" color={$colors.text} size={24} />,
                    title: t('Donation'),
                    onPress: () => {
                        navigate('DonateScreen')
                    },
                    rightArrow: <View style={{
                        flexDirection: "row",
                        alignItems: "center"
                    }}>
                        <IconFont name="arrowRight" color={$colors.border} size={14} />
                    </View>
                },
            ]} />
            <CardMenu theme={$theme} style={{
                marginTop: s(20),
            }} items={[
                {
                    icon: <IconFont name="power" color={colors.palette.red500} size={24} />,
                    title: t('Destroy the account'),
                    onPress: () => {
                        confirmModalRef.current?.open({
                            content: t("Are you sure to destroy the account?"),
                            title: t('Destroy the account'),
                            onCancel: () => { },
                            onSubmit: async () => {
                                quit();
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'WelcomeScreen' }],
                                })
                            }
                        })
                    },
                    rightArrow: null,
                    textStyle: {
                        color: "#FB3737"
                    }
                },
                {
                    icon: <IconFont name="logout" color={colors.palette.red500} size={24} />,
                    title: t("Logout"),
                    onPress: () => {
                        confirmModalRef.current?.open({
                            content: t('Are you sure to logout?'),
                            title: t("Logout"),
                            onCancel: () => { },
                            onSubmit: async () => {
                                quit();
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'WelcomeScreen' }],
                                })
                            }
                        })
                    },
                    rightArrow: null,
                    textStyle: {
                        color: "#FB3737"
                    }
                },
            ]} />
        </View>
        <ConfirmModal theme={$theme} ref={confirmModalRef} />
        <LangModal theme={$theme} ref={langModalRef} />
        <UpgradeModal theme={$theme} ref={upgradeModalRef} />
    </ScreenX>
}
