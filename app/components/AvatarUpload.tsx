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
    border?: boolean;
    size?: number;
    style?: ViewStyle
}) => {
    const { t } = useTranslation('components')
    console.log('avatar', props.avatar);
    const size = props.size ?? 64
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
            
            width: size ,
            height: size
        }} onPress={() => {
            bottomOptionModalRef.current?.open();
        }}>
            {props.avatar ? <Image source={props.avatar} style={{
                borderRadius: scale(32),
                ...(props.border ? styles.border : null),
                width: size,
                height: size
            }} /> : null}
            <Image source={require('assets/icons/circle-plus-primary.svg')} style={styles.icon} />
        </TouchableOpacity>
        <BottomOptionModal ref={bottomOptionModalRef} items={options} />
    </>
}
const styles = StyleSheet.create({
    border: {
        borderWidth: scale(3),
        borderStartColor: 'red',
        borderEndColor: '#890084',
        borderTopColor: '#8A0184',
        borderBottomColor: 'green',
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: scale(32),
    },

    icon: {
        zIndex: 1,
        position: 'absolute',
        bottom: scale(0),
        right: scale(0),
        width: scale(22),
        height: scale(22),
        borderRadius: scale(11),
    }
});
