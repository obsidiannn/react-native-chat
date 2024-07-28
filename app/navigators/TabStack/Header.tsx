import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ColorsState, ThemeState } from 'app/stores/system';
import { useRecoilValue } from 'recoil';
import { Image } from 'expo-image';
import { s } from 'app/utils/size';
import ScanModal, { ScanModalType } from 'app/components/ScanModal/ScanModal';
import MyBusinessCardModal, { MyBusinessCardModalType } from 'app/components/MyBusinessCardModal/MyBusinessCardModal';
import SettingCenterModal, { SettingCenterModalType } from 'app/components/SettingCenterModal/SettingCenterModal';
import { useRef } from 'react';
import SelectMemberModal, { SelectMemberModalType, SelectMemberOption } from "app/components/SelectMemberModal/Index"
import scanService from 'app/services/scan.service';
import ModelMenus, { ModelMenuProps } from 'app/components/ModelMenus';
import friendService from 'app/services/friend.service';
import { navigate } from '../navigationUtilities';
import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
export const Header = (props: BottomTabHeaderProps) => {
    const insets = useSafeAreaInsets();
    const $colors = useRecoilValue(ColorsState);
    const $theme = useRecoilValue(ThemeState);
    const modelMenuRef = useRef<ModelMenuProps>(null)
    const scanModalRef = useRef<ScanModalType>(null);
    const myBusinessCardModalRef = useRef<MyBusinessCardModalType>(null);
    const settingCenterModalRef = useRef<SettingCenterModalType>(null);
    const selectMemberModalRef = useRef<SelectMemberModalType>(null);
    return <View style={{
        marginTop: insets.top,
        backgroundColor: $colors.background,
        paddingHorizontal: s(16),
        paddingVertical: s(16),
        flexDirection: 'row',
        justifyContent: 'space-between',
    }}>
        <View style={{
            height:s(45),
            justifyContent:"center"
        }}>
            <Text style={{
                fontSize: 36,
                fontWeight:"600"
            }}>{props.route.name =="ChatScreen"? "信息": "个人中心"}</Text>
        </View>
        <View style={{
            flex: 1,
            height: s(45),
            flexDirection: 'row',
            justifyContent: "flex-end",
            alignItems: "center",
        }}>
            <TouchableOpacity onPress={() => {
                modelMenuRef.current?.open({
                    menus: [
                        {
                            title: "添加好友",
                            icon: require("assets/icons/user-add.svg"),
                            onPress: () => {
                                navigate("AddFriendModal")
                            },
                        },
                        {
                            title: "创建群聊",
                            icon: require("assets/icons/menu-chat.svg"),
                            onPress: async () => {
                                const users = await friendService.getOnlineList();
                                const options: SelectMemberOption[] = users.map((item) => {
                                    return {
                                        id: item.id,
                                        icon: item.avatar ?? "",
                                        title: item.nickName ?? "",
                                        name: item.nickName ?? "",
                                        name_index: item.nickNameIdx ?? "",
                                        status: false,
                                        disabled: false,
                                        pubKey: item.pubKey
                                    } as SelectMemberOption
                                });
                                selectMemberModalRef.current?.open({
                                    title: '選擇好友',
                                    options,
                                    callback: async (ops: SelectMemberOption[]) => {
                                        // 跳轉到羣組創建再返回
                                        navigate('GroupCreateScreen', {
                                            selected: ops
                                        });
                                    }
                                });
                            },
                        }
                    ]
                })
            }} style={{
                width: s(32),
                height: s(32),
                marginRight: s(16),
                backgroundColor: $colors.primary,
                borderRadius: s(16),
                justifyContent: "center",
                alignItems: "center",
            }}>
                <Image source={require('assets/icons/plus.svg')} style={{
                    width: s(20),
                    height: s(20)
                }} />
            </TouchableOpacity>
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
            scanService.scanQrcode(v)
            scanModalRef.current?.close();
        }} ref={scanModalRef} />
        <MyBusinessCardModal ref={myBusinessCardModalRef} />
        <SettingCenterModal ref={settingCenterModalRef} />
        <ModelMenus ref={modelMenuRef} />
        <SelectMemberModal ref={selectMemberModalRef} />
    </View>
}