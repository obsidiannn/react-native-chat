import BaseModal from "app/components/base-modal";
import { ColorsState } from "app/stores/system";
import { s } from "app/utils/size";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Text, View } from "react-native";
import { useRecoilValue } from "recoil";
import { OptionItem } from "./OptionItem";


export interface SettingModalType {
    open: () => void
}

export default forwardRef((_, ref) => {

    const [visible, setVisible] = useState(false)
    const themeColor = useRecoilValue(ColorsState)

    const onClose = () => {
        setVisible(false)
    }

    useImperativeHandle(ref, () => ({
        open: () => {
            setVisible(true);
        }
    }));
    return <BaseModal title="" visible={visible} onClose={onClose} >
        <View style={{
            padding: s(12)
        }}>
            <Text style={{
                color: themeColor.text,
                fontSize: s(26),
                fontWeight: "600",
            }}>
                设置
            </Text>
            <View style={{
                flex: 1,
                backgroundColor: "white",
                width: s(375),
                borderTopRightRadius: s(32),
                borderTopLeftRadius: s(32),
                paddingHorizontal: s(16),
                paddingTop: s(30)
            }}>
                <View style={{
                    width: s(343),
                    paddingVertical: s(10),
                    borderRadius: s(16),
                    overflow: "hidden",
                    backgroundColor: themeColor.secondaryBackground,
                }}>
                    <OptionItem onPress={() => {
                        console.log("edit")
                    }} icon={require('./edit-dark.png')} title="关于我们" />
                    <OptionItem onPress={() => {
                        console.log("edit")
                    }} icon={require('./edit-dark.png')} title="注销账号" />
                    <OptionItem onPress={() => {
                        console.log("edit")
                    }} icon={require('./edit-dark.png')} title="当前版本" />
                    <OptionItem onPress={() => {
                        console.log("edit")
                    }} icon={require('./edit-dark.png')} title="语言" />

                </View>
                <View style={{
                    width: s(343),
                    paddingVertical: s(10),
                    borderRadius: s(16),
                    marginTop: s(16),
                    overflow: "hidden",
                    backgroundColor: themeColor.secondaryBackground,
                }}>
                    <OptionItem onPress={() => {
                        console.log("edit")
                    }} icon={require('./edit-dark.png')} title="退出登录" />

                </View>
            </View>
        </View>


    </BaseModal>
})