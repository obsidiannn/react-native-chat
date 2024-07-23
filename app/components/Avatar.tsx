import { colors } from "app/theme"
import { scale } from "app/utils/size"
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
        display: 'flex'
    }} >
        <Image source={props.url} style={{
            ...(props.style ? { ...props.style } : { ...styles.defaultAvatar }),
            ...(props.width && props.height ? {
                width: props.width,
                height: props.height,
                borderRadius: props.width
            } : {}),
            ...(props.enableAvatarBorder ? {
                borderWidth: scale(3),
                borderStartColor: 'red',
                borderEndColor: '#890084',
                borderTopColor: '#8A0184',
                borderBottomColor: 'green',
            } : {})
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
        width: scale(48),
        height: scale(48),
        display: 'flex',
        justifyContent: 'center',
        borderRadius: scale(24),

    },
    badgeContainer: {
        position: 'relative',
        bottom: 0,
        right: 15,
        alignSelf: 'flex-end',
        padding: scale(6),
        borderColor: '#ffffff',
        borderWidth: scale(2),
        borderRadius: scale(12),
        backgroundColor: colors.palette.gray400,
    },
})

export default AvatarComponent