import { useRef } from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import BottomOptionModal, { BottomOptionModalType } from "./BottomOptionModal"
import { Image, ImageStyle } from "expo-image";
import { useTranslation } from 'react-i18next';
import { chooseImage } from "app/services/file.service";
import { scale } from "app/utils/size";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";

export default (props: {
    avatar: string;
    onChange: (v: string) => void
    style?: ViewStyle
}) => {
    const { t } = useTranslation('components')
    const themeColor = useRecoilValue(ColorsState)
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
        <TouchableOpacity style={{
            ...styles.container,
            backgroundColor: themeColor.primary,
            ...props.style
        }} onPress={() => {
            bottomOptionModalRef.current?.open();
        }}>
            {props.avatar ? <Image source={props.avatar} style={styles.avatar} /> : null}
            <Image source={require('assets/icons/circle-plus-primary.svg')} style={styles.icon} />
        </TouchableOpacity>
        <BottomOptionModal ref={bottomOptionModalRef} items={options} />
    </>
}
const styles = StyleSheet.create({
    container: {
        width: scale(64),
        height: scale(64),
        borderRadius: scale(32),
    },
    avatar: {
        width: scale(64),
        height: scale(64),
        borderRadius: scale(32),
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    icon: {
        position: 'absolute',
        bottom: scale(0),
        right: scale(0),
        width: scale(22),
        height: scale(22),
        borderRadius: scale(11),
    }
});
