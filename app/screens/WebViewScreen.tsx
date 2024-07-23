import { Dimensions, Platform, View, ViewStyle } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import WebView from "react-native-webview";
import Navbar from "app/components/Navbar";
import { ColorsState } from "app/stores/system";
import { useRecoilValue } from "recoil";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { App } from "types/app";
const { height } = Dimensions.get('window');
type Props = StackScreenProps<App.StackParamList, 'WebViewScreen'>;
export const WebViewScreen = ({ route }: Props) => {
    const $colors = useRecoilValue(ColorsState);
    const insets = useSafeAreaInsets();
    
    return (
        <View style={{
            flex: 1,
            top: Platform.OS=="ios" ? 0: insets.top,
            backgroundColor: $colors.secondaryBackground
        }}>
            <View style={$container}>
                <Navbar title={route.params.title} />
                <WebView style={$webViewContainer} source={{ uri: route.params.url }} />
            </View>
        </View>
    );
};

const $container: ViewStyle = {
    height: height,
    width: "100%"
}
const $webViewContainer: ViewStyle = {
    flex: 1,
    width: '100%',
}