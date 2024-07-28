
import { Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { useRecoilValue } from "recoil";
import { ColorsState, ThemeState } from "app/stores/system";
import { s } from "app/utils/size";
import { Image } from "expo-image";

export interface OptionItemProps {
    title: string;
    icon: any;
    onPress: () => void;
    style?: ViewStyle;
}
export const OptionItem = (props: OptionItemProps) => {
    const $colors = useRecoilValue(ColorsState);
    const $theme = useRecoilValue(ThemeState);
    return <TouchableOpacity onPress={props.onPress} style={[
        {
            height: s(50),
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: s(16),
            justifyContent: "space-between",
        }
    ]}>
        <View style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center"
        }}>
            <Image style={{
                width: s(24),
                height: s(24),
                marginRight: s(10)
            }} source={props.icon} />
            <Text style={{
                color: $colors.text,
                fontSize: s(15),
                fontWeight: "400",
            }}>{props.title}</Text>
        </View>
        <Image style={{
            width: s(24),
            height: s(24),
        }} source={$theme == "dark" ? require('./arrow-right-dark.png') : require('./arrow-right-light.png')} />
    </TouchableOpacity>
}