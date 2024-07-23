import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
    WalletScreen,
    PlazaScreen,
    ChatScreen
} from '../../screens/index'
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTab } from './BottomTab';
import { Text } from 'react-native';
import { ColorsState, ThemeState } from 'app/stores/system';
import { useRecoilValue } from 'recoil';
import { Image } from 'expo-image';
import { s } from 'app/utils/size';
import * as Screens from "app/screens"
import AvatarComponent from 'app/components/Avatar';
import { AppStackParamList } from '../AppNavigator/type';
import { AuthUser } from 'app/stores/auth';
import fileService from 'app/services/file.service';
const Header = () => {
    const insets = useSafeAreaInsets();
    const $colors = useRecoilValue(ColorsState);
    const $theme = useRecoilValue(ThemeState);
    const authUser = useRecoilValue(AuthUser)

    return <View style={{
        marginTop: insets.top,
        backgroundColor: $colors.background,
        paddingHorizontal: s(16),
        paddingVertical: s(16),
        flexDirection: 'row',
        justifyContent: 'space-between',
    }}>
        <AvatarComponent url={fileService.getFullUrl(authUser?.avatar ?? '')} online={true} enableAvatarBorder />
        <View style={{
            flex: 1,
            height: s(45),
            flexDirection: 'row',
            justifyContent: "flex-end",
            alignItems: "center",
        }}>
            <TouchableOpacity style={{
                width: s(32),
                height: s(32),
                marginRight: s(16)
            }}>
                <Image style={{
                    width: s(32),
                    height: s(32),
                }} source={$theme == "dark" ? require('./scan-dark.png') : require('./scan-light.png')} />
            </TouchableOpacity>
            <TouchableOpacity style={{
                width: s(32),
                height: s(32),
            }}>
                <Image style={{
                    width: s(32),
                    height: s(32)
                }} source={$theme == "dark" ? require('./qr-dark.png') : require('./qr-light.png')} />
            </TouchableOpacity>
        </View>
    </View>
}
export default () => {
    const insets = useSafeAreaInsets();
    const $colors = useRecoilValue(ColorsState);
    const Stack = createBottomTabNavigator<AppStackParamList>();
    return <Stack.Navigator screenOptions={{
        headerShown: true,
        // header: () => null
        header: () => <Header />
    }} initialRouteName="ChatScreen" tabBar={(props) => {
        return <View style={{
            padding: 0,
            paddingBottom: insets.bottom,
            backgroundColor: "#07101D"
        }}>
            <BottomTab {...props} />
        </View>
    }}>
        <Stack.Screen name="PlazaScreen" component={PlazaScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="WalletScreen" component={WalletScreen} />
    </Stack.Navigator>
}