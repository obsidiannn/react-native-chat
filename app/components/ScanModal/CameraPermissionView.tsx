import { Text, View, ViewStyle } from "react-native";
import { s } from "app/utils/size";
import { Button } from "../Button";
import { useTranslation } from "react-i18next";
import { $colors } from "app/Colors";
export interface CameraPermissionViewProps {
    requestPermission: () => void
    theme: 'light' | 'dark'
}
export const CameraPermissionView = (props: CameraPermissionViewProps) => {
    const {t} = useTranslation('default');
    return <View style={$container}>
        <View style={$buttonContainer}>
            <Button fullRounded theme={props.theme} onPress={() => {
                console.log("requestPermission")
                props.requestPermission()
            // }} type="primary" label={t('Request camera permission')} />
            }} type="primary" label={t('Please request camera permission')} />
        </View>
        {/*<Text style={[$tipsText]}>{t('We need to open the camera permission')}</Text>*/}
        <Text style={[$tipsText, {
            color: props.theme == "dark" ? $colors.white : $colors.black
        }]}>{t('We need you to enable camera permissions.')}</Text>
    </View>
}
const $container: ViewStyle = {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
}
const $buttonContainer: ViewStyle = {
    height: s(50),
    width: s(343),
    marginHorizontal: s(16),
}
const $tipsText = {
    marginTop: s(20),
    color: $colors.slate400
}
