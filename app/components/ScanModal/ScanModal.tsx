import Navbar from "../Navbar";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useCameraPermissions } from 'expo-camera';
import { Modal, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import { CameraPermissionView } from "./CameraPermissionView";
import { CameraWindow } from "./CameraWindow";
import { s } from "app/utils/size";
export interface ScanModalType {
    open: () => void,
    close: () => void
}
export interface ScanModalProps {
    onChange: (val: string) => void
}


export default forwardRef((props: ScanModalProps, ref) => {
    const [visible, setVisible] = useState(false);
    const insets = useSafeAreaInsets();
    const [permission, requestPermission] = useCameraPermissions();
    const $colors = useRecoilValue(ColorsState);
    const onClose = () => {
        setVisible(false)
    }
    useImperativeHandle(ref, () => ({
        open: async () => setVisible(true),
        close: async () => setVisible(false)
    }));
    return <Modal transparent={false} style={{ flex: 1 }} visible={visible} animationType="slide" >
        <View style={{
            flex: 1,
            paddingTop: insets.top,
        }}>
            <Navbar title={'扫一扫'} onLeftPress={onClose} />
            <View style={{
                flex: 1,
                backgroundColor: $colors.secondaryBackground,
                paddingTop: s(30),
            }}>
                {permission ? (!permission.granted ? <CameraPermissionView requestPermission={requestPermission} /> : (visible ? <CameraWindow onChange={(v) => {
                    props.onChange(v);
                    setVisible(false);
                }} /> : null)) : null}
            </View>

        </View>
    </Modal>
})