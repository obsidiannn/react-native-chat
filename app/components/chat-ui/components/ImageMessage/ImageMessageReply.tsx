import * as React from 'react'
import { Image, Text, View } from 'react-native'

import { MessageType, Size } from '../../types'
import { imageReduce } from 'app/utils/size'

export interface ImageMessageReplyProps {
    message: MessageType.DerivedImage
}

/** Image message component. Supports different
 * aspect ratios, renders blurred image as a background which is visible
 * if the image is narrow, renders image in form of a file if aspect
 * ratio is very small or very big. */
export const ImageMessageReply = ({ message }: ImageMessageReplyProps) => {

    const renderImage = () => {
        const { w, h } = imageReduce(message.width ?? 0, message.height ?? 0, 100)
        return (
            <Image
                accessibilityRole='image'
                resizeMode={'cover'}
                source={{ uri: message.uri }}
                style={{
                    width: w,
                    height: h
                }}
            />
        )
    }

    return (renderImage())
}