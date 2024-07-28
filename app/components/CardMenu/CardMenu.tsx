import { ColorsState } from "app/stores/system"

import { View, ViewStyle } from "react-native"
import { useRecoilValue } from "recoil"
import { s } from "app/utils/size"
import { OptionItem, OptionItemProps } from "./OptionItem"

export interface CardMenuProps {
    items: OptionItemProps[];
    style?: ViewStyle;
}
export const CardMenu = (props: CardMenuProps) => {
    const $colors = useRecoilValue(ColorsState);
    return <View style={[
        {
            width: "100%",
            paddingVertical: s(10),
            borderRadius: s(16),
            overflow: "hidden",
            backgroundColor: $colors.secondaryBackground
        },
        props.style
    ]}>
        {props.items.map((item, index) => <OptionItem key={index} {...item} />)}
    </View>
}
