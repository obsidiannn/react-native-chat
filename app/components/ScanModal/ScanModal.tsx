import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useCameraPermissions } from 'expo-camera';
import { View } from "react-native";
import { CameraPermissionView } from "./CameraPermissionView";
import { CameraWindow } from "./CameraWindow";
import { useTranslation } from "react-i18next";
import { ScreenModal, ScreenModalType } from "../ScreenModal";
export interface ScanModalType {
    open: () => void,
    close: () => void
}
export interface ScanModalProps {
    onChange: (val: string) => void
    theme: 'light' | 'dark';
}


export default forwardRef((props: ScanModalProps, ref) => {
    const [visible, setVisible] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    useImperativeHandle(ref, () => ({
        open: async () => screenModalRef.current?.open(),
        close: async () => screenModalRef.current?.close()
    }));
    const {t} = useTranslation('default');
    const screenModalRef = useRef<ScreenModalType>(null);
    return <ScreenModal theme={props.theme} ref={screenModalRef} title={t('Scan')} >
        <View style={{
                flex: 1
            }}>
                {permission ? (!permission.granted ? <CameraPermissionView theme={props.theme} requestPermission={requestPermission} /> : (visible ? <CameraWindow onChange={(v) => {
                    props.onChange(v);
                    setVisible(false);
                }} /> : null)) : null}
            </View>
    </ScreenModal>
})