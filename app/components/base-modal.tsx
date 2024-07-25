import Navbar from "./Navbar";
import { ReactNode } from "react";
import { Modal, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export interface BaseModalProps {
    styles?: ViewStyle
    children: ReactNode
    title?: string
    visible: boolean
    transparent?: boolean
    animationType?: 'none' | 'slide' | 'fade'
    onClose: () => void
    renderRight?: ReactNode
}

const BaseModal = ({
    styles,
    children,
    title,
    visible,
    onClose,
    transparent,
    animationType,
    renderRight
}: BaseModalProps) => {
    const insets = useSafeAreaInsets()
    return <Modal transparent={transparent ?? false} style={{ flex: 1 }} visible={visible} animationType={animationType} >
        <View style={{
            flex: 1,
            paddingTop: insets.top,
        }}>
            <Navbar title={title} onLeftPress={onClose} renderRight={()=>{return renderRight}}/>
            <View style={{
                ...styles
            }}>

                {children}
            </View>
        </View>
    </Modal>
}

export default BaseModal