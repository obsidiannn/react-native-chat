import { ColorsState, ThemeState } from "app/stores/system"

import { Text, View } from "react-native"
import { useRecoilValue } from "recoil"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { s } from "app/utils/size"
import Navbar from "app/components/Navbar"
import { CardMenu } from "app/components/CardMenu/CardMenu"
import ConfirmModal, { ConfirmModalType } from "app/components/ConfirmModal"
import { useRef } from "react"
import { quit } from "app/utils/account"
import { navigate } from "app/navigators"
import { App } from "types/app"
import { StackScreenProps } from "@react-navigation/stack"
import { Icon } from "app/components/Icon/Icon"
import { LangModal, LangModalType } from "./LangModal"
import { UpgradeModal, UpgradeModalType } from "./UpgradeModal"
import * as Application from 'expo-application';
type Props = StackScreenProps<App.StackParamList, 'SettingScreen'>;
export const SettingScreen = ({ navigation }: Props) => {
    const insets = useSafeAreaInsets();
    const $colors = useRecoilValue(ColorsState);
    const $theme = useRecoilValue(ThemeState);
    const confirmModalRef = useRef<ConfirmModalType>(null);
    const langModalRef = useRef<LangModalType>(null);
    const upgradeModalRef = useRef<UpgradeModalType>(null);
    const version = Application.nativeApplicationVersion;
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
        }}>设置</Text>
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
                    icon: <Icon name={$theme == "dark" ? "aboutDark" : "aboutLight"} />,
                    title: "关于我们",
                    onPress: () => {
                        navigate("WebViewScreen", {
                            title: "关于我们",
                            url: "https://www.baidu.com"
                        })
                    }
                },
                {
                    icon: <Icon name={$theme == "dark" ? "langDark" : "langLight"} />,
                    title: "语言",
                    onPress: () => {
                        langModalRef.current?.open()
                    }
                },
                {
                    icon: <Icon name={$theme == "dark" ? "bookDark" : "bookLight"} />,
                    title: "当前版本",
                    onPress: () => {
                        upgradeModalRef.current?.open()
                    },
                    rightArrow: <View style={{
                        flexDirection:"row",
                        alignItems:"center"
                    }}>
                        <Text style={{
                            color: $colors.secondaryText
                        }}>{version}</Text>
                        <Icon name="arrowRight" />
                    </View>
                },
            ]} />
            <CardMenu style={{
                marginTop: s(20),
            }} items={[
                {
                    icon: <Icon name={$theme == "dark" ? "powerDark" : "powerRed"} />,
                    title: "注销账号",
                    onPress: () => {
                        confirmModalRef.current?.open({
                            desc: "是否注销账号？",
                            title: "注销账号",
                            onCancel: () => { },
                            onSubmit: () => {
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
                        color:"#FB3737"
                    }
                },
                {
                    icon: <Icon name={$theme == "dark" ? "loginOutDark" : "loginOutRed"}/>,
                    title: "退出登录",
                    onPress: () => {
                        confirmModalRef.current?.open({
                            desc: "是否退出登录？",
                            title: "退出登录",
                            onCancel: () => { },
                            onSubmit: () => {
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
                        color:"#FB3737"
                    }
                },
            ]} />
        </View>
        <ConfirmModal ref={confirmModalRef} />
        <LangModal ref={langModalRef} />
        <UpgradeModal ref={upgradeModalRef} />
    </View>
}
