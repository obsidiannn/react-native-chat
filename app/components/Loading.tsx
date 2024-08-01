import { s } from "app/utils/size"
import { View, ActivityIndicator, Text } from "react-native"

const LoadingComponent = (props: {
    label?: string
}) => {
    return <View style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        <ActivityIndicator size="large" color="black" />
        <Text style={{ fontWeight: 400, marginTop: s(28) }}>
            {props.label ?? '加载中，稍等片刻...'}
        </Text>
    </View>
}

export default LoadingComponent
