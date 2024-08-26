import { TouchableOpacity, View, ViewStyle } from 'react-native';
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
import { useTranslation } from 'react-i18next';
import { $colors } from 'app/Colors';
export const Header = (props: BottomTabHeaderProps) => {
    const insets = useSafeAreaInsets();
    const $theme = useRecoilValue(ThemeState);
    const menuModalRef = useRef<MenuModalRef>(null)
    const scanModalRef = useRef<ScanModalType>(null);
    const myBusinessCardModalRef = useRef<MyBusinessCardModalType>(null);
    const settingCenterModalRef = useRef<SettingCenterModalType>(null);
    const selectMemberModalRef = useRef<SelectMemberModalType>(null);
    const { t } = useTranslation('default');
    const menus: IMenuItem[] = [
        {
            title: t('Add friend'),
            iconName: "userAdd",
            onPress: () => {
                navigate("AddFriendModal")
            },
        },
        {
            title: t('Create group chat'),
            iconName: "newChat",
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
                    title: t('Select friends'),
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
    return <View style={[$container, {
        marginTop: insets.top,
        backgroundColor: $theme == "dark" ? $colors.slate950 : $colors.gray100,
    }]}>
        <View style={$buttonContainer}>
            <TouchableOpacity onPress={() => {
                menuModalRef.current?.open({
                    items: menus
                })
            }} style={{
                marginRight: s(16),
            }}>
                <IconFont containerStyle={$button} backgroundColor={$theme == "dark" ? $colors.slate800 : $colors.white} name='plus' size={20} color={$theme == "dark" ? $colors.white : $colors.slate900} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
                scanModalRef.current?.open();
            }} style={{
                marginRight: s(16)
            }}>
                <IconFont containerStyle={$button} backgroundColor={$theme == "dark" ? $colors.slate800 : $colors.white} name='scan' size={20} color={$theme == "dark" ? $colors.white : $colors.slate900} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
                myBusinessCardModalRef.current?.open();
            }} >
                <IconFont containerStyle={$button} backgroundColor={$theme == "dark" ? $colors.slate800 : $colors.white} name='qrcode' size={20} color={$theme == "dark" ? $colors.white : $colors.slate900} />
            </TouchableOpacity>
        </View>
        <ScanModal onChange={(v) => {
            scanService.scanQrcode(v)
            scanModalRef.current?.close();
        }} ref={scanModalRef} />
        <MyBusinessCardModal ref={myBusinessCardModalRef} />
        <SettingCenterModal ref={settingCenterModalRef} />
        <MenuModal ref={menuModalRef} />
        <SelectMemberModal ref={selectMemberModalRef} />
    </View>
}
const $container: ViewStyle = {
    paddingHorizontal: s(16),
    paddingVertical: s(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
}
const $buttonContainer: ViewStyle = {
    flex: 1,
    height: s(45),
    flexDirection: 'row',
    justifyContent: "flex-end",
    alignItems: "center",
}
const $button: ViewStyle = {
    width: s(32),
    height: s(32),
    borderRadius: s(10),
}