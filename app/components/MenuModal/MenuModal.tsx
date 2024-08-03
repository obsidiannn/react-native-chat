import { ColorsState } from "app/stores/system";
import { s } from "app/utils/size";
import { Image } from "expo-image";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Modal, StyleSheet, View, TouchableOpacity } from "react-native";
import { useRecoilValue } from "recoil";
import { MenuItem, IMenuItem} from "./MenuItem";


export interface MenuModalRef {
    open: (params: {
        items: IMenuItem[]
    }) => void
}

export const MenuModal = forwardRef((_, ref) => {
    const themeColor = useRecoilValue(ColorsState)
    const [menus, setMenus] = useState<IMenuItem[]>([])
    const [visible, setVisible] = useState<boolean>(false)

    useImperativeHandle(ref, () => ({
        open: (params: {
            items: IMenuItem[]
        }) => {
            setMenus(params.items)
            setVisible(true)
        }
    }));

    const close = () => {
        setVisible(false)
    }

    return <Modal visible={visible} style={{flex: 1}} transparent={true} animationType="slide">
        <View style={styles.container}>
            <View style={{
                ...styles.menuArea,
                backgroundColor: themeColor.background
            }}>
                {menus.map((m, i) => <MenuItem onPress={() => {
                    m.onPress();
                    close();
                }} title={m.title} iconName={m.iconName} bottomBorder={i !== menus.length - 1} />)}
            </View>
            <View style={{ alignItems: 'center', margin: s(32), }}>
                <TouchableOpacity onPress={close} >
                    <Image source={require('assets/icons/close-opacity.svg')} style={{ width: s(36), height: s(36) }} />
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        paddingHorizontal: s(16),
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    menuArea: {
        paddingHorizontal: s(36),
        paddingVertical: s(14),
        borderRadius: s(20),
        marginTop: '40%'
    },
})
