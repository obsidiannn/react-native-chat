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
type Props = StackScreenProps<App.StackParamList, 'SettingScreen'>;
export const SettingScreen = ({navigation}:Props) => {
    const insets = useSafeAreaInsets();
    const $colors = useRecoilValue(ColorsState);
    const $theme = useRecoilValue(ThemeState);
    const confirmModalRef = useRef<ConfirmModalType>(null);

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
                    icon: $theme == "dark" ? require('./edit-dark.png') : require('./edit-light.png'),
                    title: "关于我们",
                    onPress: () => {
                        navigate("WebViewScreen", {
                            title: "关于我们",
                            url: "https://www.baidu.com"
                        })
                    },
                    theme: $theme,
                },
                // {
                //     icon: $theme == "dark" ? require('./edit-dark.png') : require('./edit-light.png'),
                //     title: "语言",
                //     onPress: () => {
                //     },
                //     theme: $theme,
                // },
                {
                    icon: $theme == "dark" ? require('./edit-dark.png') : require('./edit-light.png'),
                    title: "当前版本",
                    onPress: () => {
                    },
                    theme: $theme,
                },
            ]} />
            <CardMenu style={{
                marginTop: s(20),
            }} items={[
                {
                    icon: $theme == "dark" ? require('./edit-dark.png') : require('./edit-light.png'),
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
                    theme: $theme,
                },
                {
                    icon: $theme == "dark" ? require('./edit-dark.png') : require('./edit-light.png'),
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
                    theme: $theme,
                },
            ]} />
        </View>
        <ConfirmModal ref={confirmModalRef} />
    </View>
}
