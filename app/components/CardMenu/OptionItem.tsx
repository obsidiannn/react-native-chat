
import { Text, View, ViewStyle } from "react-native";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import { s } from "app/utils/size";
import { Image } from "expo-image";
import { ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import { TouchableOpacity } from "react-native-gesture-handler";

export interface OptionItemProps {
    title: string;
    icon: any;
    onPress: () => void;
    style?: ViewStyle;
    rightArrow?: ReactNode;
    theme: "dark" | "light";
}
export const OptionItem = (props: OptionItemProps) => {
    const $colors = useRecoilValue(ColorsState);
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
        <Icon name="arrowRight" theme={props.theme} />
    </TouchableOpacity>
}