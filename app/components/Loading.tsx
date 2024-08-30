import { $colors } from "app/Colors"
import { s } from "app/utils/size"
import { useTranslation } from "react-i18next"
import { View, ActivityIndicator, Text, ViewStyle, TextStyle } from "react-native"


export const LoadingComponent = (props: {
    label?: string;
    theme?: 'light' | 'dark'
}) => {
    const { t } = useTranslation('default')
    const { theme = "dark" } = props
    return <View style={$container}>
        <ActivityIndicator size="large" color={theme === 'light' ? $colors.black : $colors.white} />
        <Text style={[$text,{
            color: theme === 'light' ? $colors.black : $colors.white
        }]}>
            {props.label ?? t('loading')}
        </Text>
    </View>
}

export default LoadingComponent

const $container: ViewStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
}
const $text:TextStyle = {
    fontWeight: 400,
    marginTop: s(28)
}