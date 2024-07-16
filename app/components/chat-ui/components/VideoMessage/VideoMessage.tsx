import * as React from 'react'
import { ImageBackground, Text, View, Dimensions } from 'react-native'
import { Image } from 'expo-image'
import { MessageType, Size } from '../../types'
import { formatBytes, formatDuration, ThemeContext, UserContext } from '../../utils'
import styles from './styles'
import { scale } from 'app/utils/size'

export interface VideoMessageProps {
    message: MessageType.DerivedVideo
    /** Maximum message width */
    messageWidth: number
}

/** Image message component. Supports different
 * aspect ratios, renders blurred image as a background which is visible
 * if the image is narrow, renders image in form of a file if aspect
 * ratio is very small or very big. */
export const VideoMessage = ({ message, messageWidth }: VideoMessageProps) => {
    const theme = React.useContext(ThemeContext)
    const user = React.useContext(UserContext)

    const defaultHeight = message.height ?? 0
    const defaultWidth = message.width ?? 0
    const [size, setSize] = React.useState<Size>({
        height: defaultHeight,
        width: defaultWidth,
    })

    const aspectRatio = size.width / (size.height || 1)
    const isMinimized = aspectRatio < 0.1 || aspectRatio > 10
    console.log('size', size);

    const {
        horizontalImage,
        minimizedImage,
        minimizedImageContainer,
        durationText,
        sizeText,
        textContainer,
        verticalImage,
    } = styles({
        aspectRatio,
        message,
        messageWidth,
        theme,
        user,
    })

    return (
        <View style={minimizedImageContainer}>

            <ImageBackground
                accessibilityRole='image'
                resizeMode={'cover'}
                source={{ uri: message.thumbnail }}
                style={
                    {
                        ...(aspectRatio < 1
                            ? verticalImage
                            : horizontalImage),
                        justifyContent: 'center'
                    }
                }
            >
                <Image source={require('@/assets/icons/play-circle.svg')}
                    style={{
                        alignSelf: 'center',
                        tintColor: 'white',
                        width: scale(64),
                        height: scale(64)
                    }} />
                <Text style={durationText}>{formatDuration(message.duration)}</Text>
            </ImageBackground>

        </View>
    )
}
