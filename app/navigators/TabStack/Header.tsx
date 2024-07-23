import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ColorsState, ThemeState } from 'app/stores/system';
import { useRecoilValue } from 'recoil';
import { Image } from 'expo-image';
import { s } from 'app/utils/size';
import AvatarComponent from 'app/components/Avatar';
import { AuthUser } from 'app/stores/auth';
import fileService from 'app/services/file.service';
import ScanModal, { ScanModalType } from 'app/components/ScanModal/ScanModal';
import MyBusinessCardModal, { MyBusinessCardModalType } from 'app/components/MyBusinessCardModal/MyBusinessCardModal';
import SettingCenterModal,{SettingCenterModalType} from 'app/components/SettingCenterModal/SettingCenterModal';
import { useRef } from 'react';
import AvatarX from 'app/components/AvatarX';
export const Header = () => {
    const insets = useSafeAreaInsets();
    const $colors = useRecoilValue(ColorsState);
    const $theme = useRecoilValue(ThemeState);
    const authUser = useRecoilValue(AuthUser)
    const scanModalRef = useRef<ScanModalType>(null);
    const myBusinessCardModalRef = useRef<MyBusinessCardModalType>(null);
    const settingCenterModalRef = useRef<SettingCenterModalType>(null);
    return <View style={{
        marginTop: insets.top,
        backgroundColor: $colors.background,
        paddingHorizontal: s(16),
        paddingVertical: s(16),
        flexDirection: 'row',
        justifyContent: 'space-between',
    }}>
        <TouchableOpacity onPress={() => {
            settingCenterModalRef.current?.open();
        }}>
            <AvatarX uri={authUser?.avatar ?? ''} size={74} online={true} border={true} />
        </TouchableOpacity>
        <View style={{
            flex: 1,
            height: s(45),
            flexDirection: 'row',
            justifyContent: "flex-end",
            alignItems: "center",
        }}>
            <TouchableOpacity onPress={() => {
                console.log("qr scan")
                scanModalRef.current?.open();
            }} style={{
                width: s(32),
                height: s(32),
                marginRight: s(16)
            }}>
                <Image style={{
                    width: s(32),
                    height: s(32),
                }} source={$theme == "dark" ? require('./scan-dark.png') : require('./scan-light.png')} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
                myBusinessCardModalRef.current?.open();
            }} style={{
                width: s(32),
                height: s(32),
            }}>
                <Image style={{
                    width: s(32),
                    height: s(32)
                }} source={$theme == "dark" ? require('./qr-dark.png') : require('./qr-light.png')} />
            </TouchableOpacity>
        </View>
        <ScanModal onChange={(v) => {
            console.log("scan result", v)
            scanModalRef.current?.close();
        }} ref={scanModalRef}/>
        <MyBusinessCardModal ref={myBusinessCardModalRef}/>
        <SettingCenterModal ref={settingCenterModalRef}/>
    </View>
}