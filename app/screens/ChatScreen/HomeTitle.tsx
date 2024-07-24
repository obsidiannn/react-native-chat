import { ColorsState } from "app/stores/system"
import { s, scale } from "app/utils/size"
import { Image } from "expo-image"
import { View, Text, TouchableOpacity } from "react-native"
import { useRecoilValue } from "recoil"
import ModelMenus, { ModelMenuProps } from "app/components/ModelMenus"
import { useRef } from "react"
import { navigate } from "app/navigators"
import SelectMemberModal, { SelectMemberModalType, SelectMemberOption } from "app/components/SelectMemberModal/Index"
import friendService from "app/services/friend.service"
export interface HomeTitleProps {
    title: string
}

const HomeTitle = (props: HomeTitleProps) => {

    const themeColor = useRecoilValue(ColorsState)
    const modelMenuRef = useRef<ModelMenuProps>(null)
    const selectMemberModalRef = useRef<SelectMemberModalType>(null);
    return <View style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: scale(24)
    }}>
        <Text style={{
            fontWeight: 600,
            fontSize: scale(32),
            color: themeColor.title
        }}>
            {props.title}
        </Text>
        <TouchableOpacity accessibilityRole="button" onPress={() => {
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
            padding: scale(10),
            backgroundColor: themeColor.primary,
            borderRadius: scale(36)
        }}>
            <Image source={require('assets/icons/plus.svg')} style={{
                width: s(36),
                height: s(36)
            }} />
        </TouchableOpacity>
        <ModelMenus ref={modelMenuRef} />
        <SelectMemberModal ref={selectMemberModalRef} />
    </View>
}

export default HomeTitle