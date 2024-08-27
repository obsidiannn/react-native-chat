import { s } from "app/utils/size"
import { Image } from "expo-image"
import { useTranslation } from "react-i18next"
import { StyleProp, Text, View, ViewStyle } from "react-native"


interface EmptyProps {
    label?: string
    style?: StyleProp<ViewStyle>
}

export const EmptyComponent = (props: EmptyProps) => {
    const { t } = useTranslation('components')
    return <View style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        <Image source={require('assets/icons/empty.svg')} contentFit="fill" style={{
            width: s(36),
            height: s(72),
        }} />
        <Text style={{ fontWeight: 500, marginTop: s(8) }}>
            {props.label ?? t('emptyComponent.labelDefaultContent')}
        </Text>
        <Text style={{ marginTop: s(4) }}>
            {t('emptyComponent.labelDefaultDescribe')}
        </Text>
    </View>
}
