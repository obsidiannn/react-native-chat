import { colors } from "app/theme"
import { s } from "app/utils/size"
import { Image, ImageStyle } from "expo-image"
import { StyleSheet, View } from "react-native"

export interface AvatarProps {
    url: string
    online?: boolean
    style?: ImageStyle
    enableAvatarBorder?: boolean
    width?: number
    height?: number
}

const AvatarComponent = (props: AvatarProps) => {
    return <View style={{
        flexDirection: 'row',
        display: 'flex',
    }} >
        <Image source={props.url} style={{
            ...styles.defaultAvatar,
            ...(props.style ? { ...props.style } : {}),
            ...(props.width && props.height ? {
                width: props.width,
                height: props.height,
                borderRadius: props.width
            } : {}),
            ...(props.enableAvatarBorder ? styles.border : null),

        }} />
        {
            props.online !== undefined ?
                <View style={{
                    ...styles.badgeContainer,
                    ...(props.online ? {
                        backgroundColor: '#00D32D'
                    } : {})
                }}>
                </View> : null
        }
    </View>

}


const styles = StyleSheet.create({
    defaultAvatar: {
        width: s(48),
        height: s(48),
        display: 'flex',
        justifyContent: 'center',
        borderRadius: s(24),
    },
    badgeContainer: {
        position: 'relative',
        bottom: 0,
        right: 15,
        alignSelf: 'flex-end',
        padding: s(6),
        borderColor: '#ffffff',
        borderWidth: s(2),
        borderRadius: s(12),
        backgroundColor: colors.palette.gray400,
    },
    border: {
        borderWidth: s(3),
        // borderColor: 'blue',
        borderStartColor: 'red',
        borderEndColor: '#890084',
        borderTopColor: '#8A0184',
        borderBottomColor: 'green',
    },
})

export default AvatarComponent
