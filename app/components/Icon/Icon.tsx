import { s } from "app/utils/size";
import { Image } from "expo-image";
import dark from "./dark";
import light from "./light";
export type IconNameType = "arrowRight"
export interface IconProps {
    name: IconNameType;
    size?: number;
    theme?: "dark" | "light";
}
export const Icon = (props:IconProps) => {
    const { theme="dark",size=24, name } = props;
    const $icon = theme==="dark"? dark[name] : light[name];
    return <Image style={{
        width: s(size),
        height: s(size),
    }} source={$icon} />
}