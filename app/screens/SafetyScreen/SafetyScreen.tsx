import { ColorsState, ThemeState } from "app/stores/system"

import { Text, View } from "react-native"
import { useRecoilValue } from "recoil"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { s } from "app/utils/size"
import Navbar from "app/components/Navbar"
import { CardMenu } from "app/components/CardMenu/CardMenu"
import ConfirmModal, { ConfirmModalType } from "app/components/ConfirmModal"
import { useRef } from "react"
import { globalKV, globalStorage } from "app/utils/kv-tool"
import RNRestart from 'react-native-restart'; 
export const SafetyScreen = () => {
    const insets = useSafeAreaInsets();
    const $colors = useRecoilValue(ColorsState);
    const $theme = useRecoilValue(ThemeState);
    const confirmModalRef = useRef<ConfirmModalType>(null);
    return <View style={{
        flex: 1,
        paddingTop: insets.top,
        backgroundColor: $colors.secondaryBackground,
    }}>
        <Navbar />
        <Text style={{
            color: $colors.text,
            fontSize: s(26),
            fontWeight: "600",
            marginTop: s(10),
            marginLeft: s(10),
            marginVertical: s(30)
        }}>安全</Text>
        <View style={{
            flex: 1,
            backgroundColor: "white",
            width: s(375),
            borderTopRightRadius: s(32),
            borderTopLeftRadius: s(32),
            paddingHorizontal: s(16),
            paddingTop: s(30)
        }}>
            <CardMenu items={[
                // {
                //     icon: $theme == "dark" ? require('./edit-dark.png') : require('./edit-light.png'),
                //     title: "备份私钥",
                //     onPress: () => {
                        
                //     },
                //     theme: $theme,
                // },
                {
                    icon: $theme == "dark" ? require('./edit-dark.png') : require('./edit-light.png'),
                    title: "退出所有群聊",
                    onPress: () => {
                        confirmModalRef.current?.open({
                            desc: "是否退出所有群聊？",
                            title: "退出所有群聊",
                            onCancel: () => { },
                            onSubmit: () => {
                            }
                        })
                    },
                    theme: $theme,
                },
                {
                    icon: $theme == "dark" ? require('./edit-dark.png') : require('./edit-light.png'),
                    title: "清空所有消息",
                    onPress: () => {
                        confirmModalRef.current?.open({
                            desc: "是否清空所有消息？",
                            title: "清空所有消息",
                            onCancel: () => { },
                            onSubmit: () => {
                            }
                        })
                    },
                    theme: $theme,
                },
            ]} />
            <CardMenu style={{
                marginTop: s(20),
            }} items={[
                {
                    icon: $theme == "dark" ? require('./edit-dark.png') : require('./edit-light.png'),
                    title: "删除所有好友",
                    onPress: () => {
                        confirmModalRef.current?.open({
                            desc: "是否删除所有好友？",
                            title: "删除所有好友",
                            onCancel: () => { },
                            onSubmit: () => {
                            }
                        })
                    },
                    theme: $theme,
                },
                {
                    icon: $theme == "dark" ? require('./edit-dark.png') : require('./edit-light.png'),
                    title: "重置应用",
                    onPress: () => {
                        confirmModalRef.current?.open({
                            desc: "是否重置应用？",
                            title: "重置应用",
                            onCancel: () => { },
                            onSubmit: () => {
                                globalStorage.flushAll();
                                globalKV.flushAll();
                                RNRestart.restart();
                            }
                        })
                    },
                    theme: $theme,
                },
            ]} />
        </View>
        <ConfirmModal ref={confirmModalRef}/>
    </View>
}

