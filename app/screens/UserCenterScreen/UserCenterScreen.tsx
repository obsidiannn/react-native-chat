import { ThemeState } from "app/stores/system"

import { Text, View, ViewStyle } from "react-native"
import { useRecoilValue } from "recoil"
import { AuthUser } from "app/stores/auth"
import { s } from "app/utils/size"
import { navigate } from "app/navigators"
import { CardMenu } from "app/components/CardMenu/CardMenu"
import AvatarComponent from "app/components/Avatar"
import fileService from "app/services/file.service"
import { IconFont } from "app/components/IconFont/IconFont"
import { $colors } from "app/Colors"
import { useTranslation } from "react-i18next"
export const UserCenterScreen = () => {
    const authUser = useRecoilValue(AuthUser);
    const $theme = useRecoilValue(ThemeState);
    const { t } = useTranslation('default');
    return <View style={$container}>
        <View style={[
            {
                flex: 1,
                backgroundColor: $theme == "dark" ? $colors.slate800 : $colors.gray100,
            },
            $lightContainer
        ]}>
        <View style={[
            $contentContainer,
            {
                backgroundColor: $theme == "dark" ? $colors.slate800 : $colors.gray100,
            },
        ]}>
            <View style={$avatarContainer}>
                <AvatarComponent enableAvatarBorder width={74} height={74} url={fileService.getFullUrl(authUser?.avatar ?? '')} online={true} style={{
                    marginTop: s(-42)
                }} />
            </View>
            <View style={{
                height: s(74),
                justifyContent: 'center'
            }}>
                <Text style={{
                    color: $theme == "dark" ? $colors.white : $colors.slate700,
                    fontSize: s(28),
                    fontWeight: "600"
                }}>{authUser?.nickName}</Text>
            </View>
            <CardMenu theme={$theme} items={[
                {
                    icon: <IconFont name="pencil" color={$theme == "dark" ? $colors.white : $colors.slate700} size={24} />,
                    title: t('Edit Profile'),
                    onPress: () => {
                        navigate("ProfileScreen")
                    },
                },
                {
                    icon: <IconFont name="userRemove" color={$theme == "dark" ? $colors.white : $colors.slate700} size={24} />,
                    title: t('Favorites'),
                    onPress: () => {
                        navigate('CollectScreen')
                    },
                },
                {
                    icon: <IconFont name="safety" color={$theme == "dark" ? $colors.white : $colors.slate700} size={24} />,
                    title: t('Security'),
                    onPress: () => navigate("SafetyScreen"),
                },
                {
                    icon: <IconFont name="setting" color={$theme == "dark" ? $colors.white : $colors.slate700} size={24} />,
                    title: t('Settings'),
                    onPress: () => navigate("SettingScreen"),
                },
            ]} />
        </View>
    </View>
    </View >
}
const $container:ViewStyle = {
    flex: 1,
    backgroundColor: $colors.slate950,
}
const $lightContainer:ViewStyle = {
    borderBottomEndRadius: s(20),
    borderBottomStartRadius: s(20),
    borderBottomWidth: 1,
    overflow: 'hidden',
}
const $contentContainer: ViewStyle = {
    flex: 1,
    borderTopRightRadius: s(32),
    borderTopLeftRadius: s(32),
    padding: s(16),
    marginTop: s(42)
}
const $avatarContainer: ViewStyle = {
    position: "relative",
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
}