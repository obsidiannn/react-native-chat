import { ColorsState, ThemeState } from "app/stores/system"

import { Text, View } from "react-native"
import { useRecoilValue } from "recoil"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { AuthUser } from "app/stores/auth"
import { s } from "app/utils/size"
import AvatarX from "app/components/AvatarX"
import { OptionItem } from "./OptionItem"
import Navbar from "app/components/Navbar"
export const ProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const $colors = useRecoilValue(ColorsState);
    const authUser = useRecoilValue(AuthUser);
    const $theme = useRecoilValue(ThemeState);
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
            marginVertical:s(30)
        }}>编辑资料</Text>
        <View style={{
            width:s(343),
            padding:s(16),
        }}>
        <AvatarX border size={74} uri={authUser?.avatar ?? ''} online={true} />
        </View>
        <View style={{
            flex: 1,
            backgroundColor: "white",
            width: s(375),
            borderTopRightRadius: s(32),
            borderTopLeftRadius: s(32),
            paddingHorizontal: s(15),
            paddingTop:s(30)
        }}>
            <View style={{
                width: s(343),
                paddingVertical: s(10),
                borderRadius: s(16),
                overflow: "hidden",
                backgroundColor: $colors.secondaryBackground
            }}>
                <OptionItem onPress={() => {
                    console.log("edit")
                }} icon={$theme == "dark" ? require('./edit-dark.png') : require('./edit-light.png')} title="用户名" />
                <OptionItem onPress={() => {
                    console.log("edit")
                }} icon={$theme == "dark" ? require('./edit-dark.png') : require('./edit-light.png')} title="昵称" />
                <OptionItem style={{
                    marginTop: s(10)
                }} onPress={() => {
                    console.log("safe")
                }} icon={$theme == "dark" ? require('./safe-dark.png') : require('./safe-light.png')} title="性别" />
                <OptionItem style={{
                    marginTop: s(10)
                }} onPress={() => {
                    console.log("setting")
                }} icon={$theme == "dark" ? require('./setting-dark.png') : require('./setting-light.png')} title="简介" />

            </View>
        </View>

    </View>
}
