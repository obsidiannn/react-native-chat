import { scale } from "app/utils/size"
import { Image, ImageStyle } from "expo-image"


export interface IconProps {
    styles?: ImageStyle
    width?: number
    height?: number
    path: string
    color?: string
}

export const Icon = (props: IconProps) => {
    const renderStyle = () => {
        if (props.styles) {
            return props.styles
        }
        if (props.width && props.height) {
            return {
                width: scale(props.width), height: scale(props.height)
            }
        }
        return {
            width: scale(24), height: scale(24)
        }
    }
    return <Image source={props.path} style={{
        ...(renderStyle()),
        ...(props.color ? {
            tintColor: props.color
        } : {})
    }} />
}

export default Icon