import { ColorsState, ThemeState } from "app/stores/system"

import { Text, View } from "react-native"
import { useRecoilValue } from "recoil"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { AuthUser } from "app/stores/auth"
import { s } from "app/utils/size"
import { navigate } from "app/navigators"
import { CardMenu } from "app/components/CardMenu/CardMenu"
import AvatarComponent from "app/components/Avatar" 
import fileService from "app/services/file.service"
import { IconFont } from "app/components/IconFont/IconFont"
export const UserCenterScreen = () => {
    const insets = useSafeAreaInsets();
    const $colors = useRecoilValue(ColorsState);
    const authUser = useRecoilValue(AuthUser);
    const $theme = useRecoilValue(ThemeState);

    console.log('authuser=', authUser);

    return <View style={{
        flex: 1,
        paddingTop: insets.top,
        backgroundColor: $colors.background,
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
                <AvatarComponent enableAvatarBorder width={74} height={74} url={fileService.getFullUrl(authUser?.avatar ?? '')} online={true} style={{
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
                    icon: <IconFont name="pencil" color={$colors.text} size={24} />,
                    title: "编辑资料",
                    onPress: () => {
                        navigate("ProfileScreen")
                    },
                },
                {
                    icon: <IconFont name="safety" color={$colors.text} size={24} />,
                    title: "安全",
                    onPress: () => navigate("SafetyScreen"),
                },
                {
                    icon: <IconFont name="setting" color={$colors.text} size={24} />,
                    title: "设置",
                    onPress: () => navigate("SettingScreen"),
                },
            ]} />
        </View>
    </View>
}
