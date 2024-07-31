import { s } from "app/utils/size";
import { Image, ImageStyle } from "expo-image";
import * as icons from "./icons";
export type IconNameType = keyof typeof icons;
export interface IconProps {
    name: IconNameType;
    size?: number;
    style?: ImageStyle;
}
export const Icon = (props: IconProps) => {
    const { size = 24, name } = props;
    const $icon = icons[name];
    return <Image style={[
        {width: s(size),height: s(size)},
        props.style
    ]} source={$icon} />
}