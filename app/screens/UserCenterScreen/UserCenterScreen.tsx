import { ColorsState, ThemeState } from "app/stores/system"

import { Text, View } from "react-native"
import { useRecoilValue } from "recoil"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { AuthUser } from "app/stores/auth"
import { s } from "app/utils/size"
import { navigate } from "app/navigators"
import { CardMenu } from "app/components/CardMenu/CardMenu"
import AvatarComponent from "app/components/Avatar"
export const UserCenterScreen = () => {
    const insets = useSafeAreaInsets();
    const $colors = useRecoilValue(ColorsState);
    const authUser = useRecoilValue(AuthUser);
    const $theme = useRecoilValue(ThemeState);

    console.log('authuser=', authUser);

    return <View style={{
        flex: 1,
        paddingTop: insets.top,
        backgroundColor: $colors.secondaryBackground,
    }}>
        <View style={{
            flex: 1,
            backgroundColor: "white",
            borderTopRightRadius: s(32),
            borderTopLeftRadius: s(32),
            padding: s(16),
            marginTop: s(42)
        }}>
            <View style={{
                position: "relative",
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',

            }}>
                <AvatarComponent enableAvatarBorder width={74} height={74} url={authUser?.avatar ?? ''} online={true} style={{
                    marginTop: s(-42)
                }} />
            </View>
            <View style={{
                height: s(74),
                justifyContent: 'center'
            }}>
                <Text style={{
                    color: $colors.text,
                    fontSize: s(28),
                    fontWeight: "600"
                }}>{authUser?.nickName}</Text>
            </View>
            <CardMenu items={[
                {
                    icon: $theme == "dark" ? require('./edit-dark.png') : require('./edit-light.png'),
                    title: "编辑资料",
                    onPress: () => {
                        navigate("ProfileScreen")
                    },
                    theme: $theme,
                },
                {
                    icon: $theme == "dark" ? require('./safe-dark.png') : require('./safe-light.png'),
                    title: "安全",
                    onPress: () => navigate("SafetyScreen"),
                    theme: $theme,
                },
                {
                    icon: $theme == "dark" ? require('./setting-dark.png') : require('./setting-light.png'),
                    title: "设置",
                    onPress: () => navigate("SettingScreen"),
                    theme: $theme,
                },
            ]} />
        </View>
    </View>
}
