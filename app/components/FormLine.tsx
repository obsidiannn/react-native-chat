
import { Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import { s } from "app/utils/size";
import { ReactNode } from "react";

export interface FormLineProps {
    title: string;
    renderLeft: ReactNode
    renderRight?: ReactNode
    onPress: () => void;
    style?: ViewStyle;
}
export const FormLine = (props: FormLineProps) => {
    const $colors = useRecoilValue(ColorsState);
    return <TouchableOpacity onPress={props.onPress} style={[
        {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: s(16),
            paddingVertical: s(18),
            justifyContent: "space-between",
        },
        props.style
    ]}>
        <View style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center"
        }}>
            {props.renderLeft}
            <Text style={{
                color: $colors.text,
                fontSize: s(15),
                fontWeight: "400",
            }}>
                {props.title}
            </Text>
        </View>
        {props.renderRight}

    </TouchableOpacity>
}