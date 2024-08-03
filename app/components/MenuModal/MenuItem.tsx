import { ColorsState } from "app/stores/system";
import { s } from "app/utils/size";
import { Text, TouchableOpacity, ViewStyle } from "react-native";
import { useRecoilValue } from "recoil";
import { Icon, IconNameType } from "../Icon/Icon";
import { ImageStyle } from "expo-image";

export interface IMenuItem {
    title: string
    onPress: () => void
    iconName?: IconNameType
}


export const MenuItem = (props: {
    title: string;
    onPress: () => void;
    iconName?: IconNameType;
    bottomBorder?: boolean
}) => {
    const $colors = useRecoilValue(ColorsState)
    const { title,onPress,iconName, bottomBorder = false } = props
    return <TouchableOpacity
        style={[
            $container,
            bottomBorder && {
                borderBottomColor: $colors.border,
                borderBottomWidth: s(0.5)
            }
        ]} onPress={onPress}>
        {iconName ? <Icon name={iconName} style={$icon} /> : null}
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