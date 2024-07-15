import * as React from 'react'
import {
  GestureResponderEvent,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native'

import { L10nContext, ThemeContext } from '../../utils'
import { View } from 'react-native-ui-lib'
import { useTranslation } from 'react-i18next'

export interface SendButtonPropsAdditionalProps {
  touchableOpacityProps?: TouchableOpacityProps
}

export interface SendButtonProps extends SendButtonPropsAdditionalProps {
  /** Callback for send button tap event */
  onPress: () => void
}

export const SendButton = ({
  onPress,
  touchableOpacityProps,
}: SendButtonProps) => {
  const theme = React.useContext(ThemeContext)
  const {t} = useTranslation('chat-ui')
  const handlePress = (event: GestureResponderEvent) => {
    onPress()
    touchableOpacityProps?.onPress?.(event)
  }

  return (
    <TouchableOpacity
      accessibilityLabel={t('btn_send')}
      accessibilityRole='button'
      {...touchableOpacityProps}
      onPress={handlePress}
      style={styles.sendButton}
    >
      <View style={{
          backgroundColor: theme.colors.primary,
          padding: 6,
          paddingHorizontal: 14,
          borderRadius: 16,
      }}>
      <Text style={{
        color: theme.colors.inputBackground,
      }}>{
        t('btn_send')
      }</Text>
      </View>
      {/* {theme.icons?.sendButtonIcon?.() ?? (
        <Image
          source={require('../../assets/icon-send.png')}
          style={{ tintColor: theme.colors.inputText }}
        />
      )} */}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  sendButton: {
    marginLeft: 16,
  },
})
