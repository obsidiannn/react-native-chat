import { Dimensions, View, ViewStyle } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import WebView from "react-native-webview";
import Navbar from "app/components/Navbar";
import { AppStackParamList } from "app/navigators";
import { Screen } from "app/components";
import { ColorsState } from "app/stores/system";
import { useRecoilValue } from "recoil";

const { height } = Dimensions.get('window');
type Props = StackScreenProps<AppStackParamList, 'WebViewScreen'>;
export const WebViewScreen = ({ route }: Props) => {
    const $colors = useRecoilValue(ColorsState);
    return (
        <Screen preset="fixed" safeAreaEdges={["start"]} backgroundColor={$colors.secondaryBackground}>
            <View style={$container}>
                <Navbar title={route.params.title} />
                <WebView style={$webViewContainer} source={{ uri: route.params.url }} />
            </View>
        </Screen>
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