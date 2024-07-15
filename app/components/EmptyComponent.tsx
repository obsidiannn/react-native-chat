import { scale } from "app/utils/size"
import { Image } from "expo-image"
import { StyleProp, Text, View, ViewStyle } from "react-native"


interface EmptyProps {
    label?: string
    style?: StyleProp<ViewStyle>
}

export const EmptyComponent = (props: EmptyProps) => {
    return <View style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        <Image source={require('assets/icons/empty.svg')} contentFit="fill" style={{
            width: scale(36),
            height: scale(72),
        }} />
        <Text style={{ fontWeight: 500, marginTop: scale(8) }}>
            {props.label ?? '目前没有打开的社区'}
        </Text>
        <Text style={{ marginTop: scale(4) }}>
            但感觉良好
        </Text>
    </View>
}