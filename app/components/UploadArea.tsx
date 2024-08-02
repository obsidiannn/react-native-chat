import { ReactNode, useRef } from "react";
import { TouchableOpacity, ViewStyle } from "react-native";
import BottomOptionModal, { BottomOptionModalType } from "./BottomOptionModal"
import { useTranslation } from 'react-i18next';
import { chooseImage } from "app/services/file.service";

export const UploadArea = (props: {
    onChange: (v: string) => void
    children: ReactNode
    style?: ViewStyle
}) => {
    const { t } = useTranslation('components')
    const bottomOptionModalRef = useRef<BottomOptionModalType>();
    const options = [
        {
            title: t('upload.label_camera'),
            onPress: () => {
                chooseImage(true, {
                    aspect: [1, 1],
                    quality: 0.5,
                }).then((uri) => {
                    console.log(uri);

                    if (!uri) {
                        return;
                    }
                    props.onChange(uri);
                });
            }
        },
        {
            title: t('upload.label_pick_album'),
            onPress: () => {
                chooseImage(false, {
                    aspect: [1, 1],
                    quality: 0.5,
                }).then((uri) => {
                    if (!uri) {
                        return;
                    }
                    props.onChange(uri);
                });
            }
        },
    ];
    return <>
        <TouchableOpacity style={props.style} onPress={() => {
            bottomOptionModalRef.current?.open();
        }}>
            {props.children}
        </TouchableOpacity>
        <BottomOptionModal ref={bottomOptionModalRef} items={options} />
    </>
}

