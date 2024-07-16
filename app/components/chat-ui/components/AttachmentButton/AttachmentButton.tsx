import * as React from 'react'
import {
  GestureResponderEvent,

  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native'

import { Image } from 'expo-image'
import { L10nContext, ThemeContext } from '../../utils'
import { scale } from 'app/utils/size'

export interface AttachmentButtonAdditionalProps {
  touchableOpacityProps?: TouchableOpacityProps
}

export interface AttachmentButtonProps extends AttachmentButtonAdditionalProps {
  /** Callback for attachment button tap event */
  onPress?: () => void
}

export const AttachmentButton = ({
  onPress,
  touchableOpacityProps,
}: AttachmentButtonProps) => {
  const l10n = React.useContext(L10nContext)
  const theme = React.useContext(ThemeContext)

  const handlePress = (event: GestureResponderEvent) => {
    onPress?.()
    touchableOpacityProps?.onPress?.(event)
  }

  return (
    <TouchableOpacity
      accessibilityLabel={l10n.attachmentButtonAccessibilityLabel}
      accessibilityRole='button'
      {...touchableOpacityProps}
      onPress={handlePress}
    >
      {theme.icons?.attachmentButtonIcon?.() ?? (
        <View style={{
          backgroundColor: theme.colors.primary,
          padding: scale(8),
          borderRadius: scale(24)
        }}>

          <Image
            source={require('../../assets/plus.svg')}
            // source={require('../../assets/icon-attachment.png')}
            style={[styles.image, { tintColor: theme.colors.background }]}
          />
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  image: {
    width: 24,
    height: 24
  },
})
