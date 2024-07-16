import { StyleSheet } from 'react-native'

import { Theme } from '../../types'
import { scale } from 'app/utils/size'

export default ({ theme }: { theme: Theme }) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: theme.colors.inputValueBackground,
      borderRadius: scale(36),
      margin: scale(12)
    },
    input: {
      ...theme.fonts.inputTextStyle,
      color: theme.colors.inputText,
      flex: 1,
      maxHeight: 100,
      // Fixes default paddings for Android
      borderRadius: 8,
      backgroundColor: theme.colors.inputValueBackground,
      paddingBottom: 5,
      paddingLeft: 8,
      paddingTop: 5,
    },
    marginRight: {
      marginRight: 16,
    },
  })
