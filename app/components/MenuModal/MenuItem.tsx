import { ColorsState } from "app/stores/system";
import { s } from "app/utils/size";
import { Text, TouchableOpacity, ViewStyle } from "react-native";
import { useRecoilValue } from "recoil";
import { ImageStyle } from "expo-image";
import { IconFont, IconFontNameType } from "../IconFont/IconFont";

export interface IMenuItem {
    title: string
    onPress: () => void
    iconName?: IconFontNameType
    size?: number
}


export const MenuItem = (props: {
    title: string;
    onPress: () => void;
    iconName?: IconFontNameType;
    bottomBorder?: boolean
    size?: number
}) => {
    const $colors = useRecoilValue(ColorsState)
    const { title, onPress, iconName, bottomBorder = false } = props
    return <TouchableOpacity
        style={[
            $container,
            bottomBorder && {
                borderBottomColor: $colors.border,
                borderBottomWidth: s(0.5)
            }
        ]} onPress={onPress}>
        {iconName ? <IconFont name={iconName} size={props.size ?? 24} color={$colors.text} /> : null}
        <Text>{title}</Text>
    </TouchableOpacity>
}
const $container: ViewStyle = {
    paddingVertical: s(24),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
}
const $icon: ImageStyle = {
    marginRight: s(8)
}