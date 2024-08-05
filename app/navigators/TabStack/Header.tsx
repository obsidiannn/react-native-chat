import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ColorsState, ThemeState } from 'app/stores/system';
import { useRecoilValue } from 'recoil';
import { s } from 'app/utils/size';
import ScanModal, { ScanModalType } from 'app/components/ScanModal/ScanModal';
import MyBusinessCardModal, { MyBusinessCardModalType } from './MyBusinessCardModal/MyBusinessCardModal';
import SettingCenterModal, { SettingCenterModalType } from 'app/components/SettingCenterModal/SettingCenterModal';
import { useRef } from 'react';
import SelectMemberModal, { SelectMemberModalType, SelectMemberOption } from "app/components/SelectMemberModal/Index"
import scanService from 'app/services/scan.service';
import friendService from 'app/services/friend.service';
import { navigate } from '../navigationUtilities';
import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import { MenuModalRef, MenuModal } from 'app/components/MenuModal/MenuModal';
import { IMenuItem } from 'app/components/MenuModal/MenuItem';
import { IconFont } from 'app/components/IconFont/IconFont';
export const Header = (props: BottomTabHeaderProps) => {
    const insets = useSafeAreaInsets();
    const $colors = useRecoilValue(ColorsState);
    const $theme = useRecoilValue(ThemeState);
    const menuModalRef = useRef<MenuModalRef>(null)
    const scanModalRef = useRef<ScanModalType>(null);
    const myBusinessCardModalRef = useRef<MyBusinessCardModalType>(null);
    const settingCenterModalRef = useRef<SettingCenterModalType>(null);
    const selectMemberModalRef = useRef<SelectMemberModalType>(null);
    const chatMenus:IMenuItem[] = [
        {
            title: "添加好友",
            iconName: $theme == "dark" ? "addFriendDark" : "addFriendLight",
            onPress: () => {
                navigate("AddFriendModal")
            },
        },
        {
            title: "创建群聊",
            iconName: $theme == "dark" ? "newChatDark" : "newChatLight",
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
    return <View style={{
        marginTop: insets.top,
        backgroundColor: $colors.background,
        paddingHorizontal: s(16),
        paddingVertical: s(16),
        flexDirection: 'row',
        justifyContent: 'space-between',
    }}>
        <View style={{
            flex: 1,
            height: s(45),
            flexDirection: 'row',
            justifyContent: "flex-end",
            alignItems: "center",
        }}>
            <TouchableOpacity onPress={() => {
                console.log(chatMenus);
                menuModalRef.current?.open({
                    items: chatMenus
                })
            }} style={{
                marginRight: s(16),
            }}>
                <IconFont containerStyle={{
                    width: s(32),
                    height: s(32),
                    borderRadius: s(10),
                }} backgroundColor="#F0F2F5" name='plus' size={20} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
                console.log("qr scan")
                scanModalRef.current?.open();
            }} style={{
                marginRight: s(16)
            }}>
                <IconFont containerStyle={{
                    width: s(32),
                    height: s(32),
                    borderRadius: s(10),
                }} backgroundColor="#F0F2F5" name='scan' size={20} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
                myBusinessCardModalRef.current?.open();
            }} >
                <IconFont containerStyle={{
                    width: s(32),
                    height: s(32),
                    borderRadius: s(10),
                }} backgroundColor="#F0F2F5" name='qrcode' size={20} color="black" />
            </TouchableOpacity>
        </View>
        <ScanModal onChange={(v) => {
            console.log("scan result", v)
            scanService.scanQrcode(v)
            scanModalRef.current?.close();
        }} ref={scanModalRef} />
        <MyBusinessCardModal ref={myBusinessCardModalRef} />
        <SettingCenterModal ref={settingCenterModalRef} />
        <MenuModal ref={menuModalRef} />
        <SelectMemberModal ref={selectMemberModalRef} />
    </View>
}