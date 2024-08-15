import * as React from 'react'
import { Image, Text, View } from 'react-native'

import { MessageType, Theme } from '../../types'
import {
    formatBytes,
    ThemeContext,
    translate,
    UserContext,
} from '../../utils'
import { StyleSheet } from 'react-native'
import { s, vs } from 'app/utils/size'
import { colors } from 'app/theme'

export interface FileMessageReplyProps {
    message: MessageType.DerivedFile
}

export const FileMessageReply = ({ message }: FileMessageReplyProps) => {
    const theme = React.useContext(ThemeContext)
    const user = React.useContext(UserContext)
    const { container, icon, iconContainer, name, size, textContainer } = styles({
        theme,
    })

    return (
        <View
            accessibilityLabel={translate("chatUI.fileButtonAccessibilityLabel")}
            style={container}
        >
            <View style={iconContainer}>
                {theme.icons?.documentIcon?.() ?? (
                    <Image
                        source={require('../../assets/icon-document.png')}
                        style={icon}
                    />
                )}
            </View>
            <View style={textContainer}>
                <Text style={name}>{message.name}</Text>
                <Text style={size}>{formatBytes(message.size)}</Text>
            </View>
        </View>
    )
}


const styles = ({
    theme,
}: {
    theme: Theme
}) =>
    StyleSheet.create({
        container: {
            alignItems: 'center',
            flexDirection: 'row',
            padding: theme.insets.messageInsetsVertical,
            paddingRight: theme.insets.messageInsetsHorizontal,
            backgroundColor: 'white',
            borderRadius: s(12)
        },
        icon: {
            tintColor: theme.colors.sentMessageDocumentIcon
        },
        iconContainer: {
            alignItems: 'center',
            backgroundColor: theme.colors.primary,
            borderRadius: 21,
            height: vs(42),
            justifyContent: 'center',
            width: s(42),
        },
        name: {
            ...(theme.fonts.receivedMessageBodyTextStyle),
            flexWrap: "wrap",
        }
        ,
        size: {
            ...( theme.fonts.sentMessageCaptionTextStyle),
            color: colors.palette.gray400,
            marginTop: vs(4),
        },
        textContainer: {
            flexShrink: 1,
            marginLeft: s(16),
        },
    })