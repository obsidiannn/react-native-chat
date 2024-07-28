import { ColorsState, ThemeState } from "app/stores/system"

import { Text,View } from "react-native"
import { useRecoilValue } from "recoil"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { s } from "app/utils/size"
import { OptionItem } from "./OptionItem"
import Navbar from "app/components/Navbar"
export const SettingScreen = () => {
  const insets = useSafeAreaInsets();
  const $colors = useRecoilValue(ColorsState);
  const $theme = useRecoilValue(ThemeState);
  return <View style={{
    flex: 1,
    paddingTop: insets.top,
    backgroundColor: $colors.secondaryBackground,
}}>
    <Navbar/>
    <Text style={{
        color: $colors.text,
        fontSize: s(26),
        fontWeight: "600",
        marginTop: s(10),
        marginLeft: s(10),
        marginVertical:s(30)
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
        <View style={{
            width: s(343),
            paddingVertical: s(10),
            borderRadius: s(16),
            overflow: "hidden",
            backgroundColor: $colors.secondaryBackground,
        }}>
            <OptionItem onPress={() => {
                console.log("edit")
            }} icon={$theme == "dark" ? require('./edit-dark.png') : require('./edit-light.png')} title="关于我们" />
            <OptionItem onPress={() => {
                console.log("edit")
            }} icon={$theme == "dark" ? require('./edit-dark.png') : require('./edit-light.png')} title="注销账号" />
            <OptionItem onPress={() => {
                console.log("edit")
            }} icon={$theme == "dark" ? require('./edit-dark.png') : require('./edit-light.png')} title="当前版本" />
            <OptionItem onPress={() => {
                console.log("edit")
            }} icon={$theme == "dark" ? require('./edit-dark.png') : require('./edit-light.png')} title="语言" />

        </View>
        <View style={{
            width: s(343),
            paddingVertical: s(10),
            borderRadius: s(16),
            marginTop: s(16),
            overflow: "hidden",
            backgroundColor: $colors.secondaryBackground,
        }}>
            <OptionItem onPress={() => {
                console.log("edit")
            }} icon={$theme == "dark" ? require('./edit-dark.png') : require('./edit-light.png')} title="退出登录" />

        </View>
    </View>

</View>
}
