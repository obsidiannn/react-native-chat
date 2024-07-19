import * as React from 'react'
import {
  GestureResponderEvent,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native'

import {  ThemeContext, translate } from '../../utils'

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

  const handlePress = (event: GestureResponderEvent) => {
    onPress()
    touchableOpacityProps?.onPress?.(event)
  }

  return (
    <TouchableOpacity
      accessibilityLabel={translate('chatUI.btnSend')}
      accessibilityRole='button'
      {...touchableOpacityProps}
      onPress={handlePress}
      style={styles.sendButton}
    >
      <View style={{
        backgroundColor: theme.colors.secondary,
        padding: 8,
        paddingHorizontal: 14,
        borderRadius: 16,
      }}>
        <Text style={{
          color: theme.colors.inputText,
        }}>{
            translate('chatUI.btnSend')
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
