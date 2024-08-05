
import { Text, TextStyle, View, ViewStyle } from "react-native";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import { s } from "app/utils/size";
import { ReactNode } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { IconFont } from "../IconFont/IconFont";

export interface OptionItemProps {
    title: string;
    icon?: ReactNode;
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    rightArrow?: ReactNode;
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
            {props.icon}
            <Text style={[
                {
                    color: $colors.text,
                    fontSize: s(15),
                    fontWeight: "400",
                },
                props.textStyle
            ]}>{props.title}</Text>
        </View>
        {props.rightArrow === undefined ? <IconFont name="arrowRight" size={16} color={$colors.border} /> : props.rightArrow}
    </TouchableOpacity>
}