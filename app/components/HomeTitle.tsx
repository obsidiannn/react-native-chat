import { ColorsState } from "app/stores/system"
import { scale } from "app/utils/size"
import { Image } from "expo-image"
import { View, Text, TouchableOpacity } from "react-native"
import { useRecoilValue } from "recoil"
import ModelMenus, { ModelMenuProps } from "./ModelMenus"
import { useRef } from "react"
import { navigate } from "app/navigators"

export interface HomeTitleProps {
    title: string
}

const HomeTitle = (props: HomeTitleProps) => {

    const themeColor = useRecoilValue(ColorsState)
    const modelMenuRef = useRef<ModelMenuProps>(null)

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
            console.log('open');
            
            modelMenuRef.current?.open({
                menus: [
                    {
                        title: "添加好友",
                        icon: require("assets/icons/user-add.svg"),
                        onPress: () => {
                            navigate('AddFriendModal')
                        },
                    },
                    {
                        title: "创建群聊",
                        icon: require("assets/icons/menu-chat.svg"),
                        onPress: () => {

                        },
                    }
                ]
            })
        }} style={{
            padding: scale(10),
            backgroundColor: themeColor.primary,
            borderRadius: scale(24)
        }}>
            <Image source={require('assets/icons/plus.svg')} style={{
                width: scale(24),
                height: scale(24)
            }} />
        </TouchableOpacity>
        <ModelMenus ref={modelMenuRef} />
    </View>
}

export default HomeTitle