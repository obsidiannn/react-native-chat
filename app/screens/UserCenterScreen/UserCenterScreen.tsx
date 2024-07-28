import { ColorsState, ThemeState } from "app/stores/system"

import { Text,View } from "react-native"
import { useRecoilValue } from "recoil"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { AuthUser } from "app/stores/auth"
import { s } from "app/utils/size"
import AvatarX from "app/components/AvatarX"
import { navigate } from "app/navigators"
import { CardMenu } from "app/components/CardMenu/CardMenu"
export const UserCenterScreen = () => {
  const insets = useSafeAreaInsets();
  const $colors = useRecoilValue(ColorsState);
  const authUser = useRecoilValue(AuthUser);
  const $theme = useRecoilValue(ThemeState);
  return <View style={{
    flex: 1,
    paddingTop: insets.top,
    backgroundColor: $colors.secondaryBackground,
}}>
    <View style={{
        flex: 1,
        backgroundColor: "white",
        width: s(375),
        borderTopRightRadius: s(32),
        borderTopLeftRadius: s(32),
        paddingHorizontal: s(16)
    }}>
        <View style={{
            position: "relative",
            top: s(-30),
            height: s(44),
        }}>
            <AvatarX border size={74} uri={authUser?.avatar ?? ''} online={true} />
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
                onPress: () => navigate("ProfileScreen"),
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
        ]}/>
    </View>

</View>
}
