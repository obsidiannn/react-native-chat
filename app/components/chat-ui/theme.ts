import { ColorValue } from 'react-native'

import { Theme } from './types'
import { $dark, colors } from 'app/theme'

// For internal usage only. Use values from theme itself.

/** @see {@link ThemeColors.userAvatarNameColors} */
export const COLORS: ColorValue[] = [
  '#ff6767',
  '#66e0da',
  '#f5a2d9',
  '#f0c722',
  '#6a85e5',
  '#fd9a6f',
  '#92db6e',
  '#73b8e5',
  '#fd7590',
  '#c78ae5',
]

/** Dark */
const DARK = '#1f1c38'

/** Error */
const ERROR = '#ff6767'

/** N0 */
const NEUTRAL_0 = '#1d1c21'

/** N2 */
const NEUTRAL_2 = '#9e9cab'

/** N7 */
const NEUTRAL_7 = '#ffffff'

/** N7 with opacity */
const NEUTRAL_7_WITH_OPACITY = '#ffffff80'

/** Primary */
const PRIMARY = '#6f61e8'

/** Secondary */
const SECONDARY = '#f5f5f7'

/** Secondary dark */
const SECONDARY_DARK = '#2b2250'

/** Default chat theme which implements {@link Theme} */
export const defaultTheme: Theme = {
  borders: {
    inputBorderRadius: 10,
    messageBorderRadius: 20,
    chatTopRadius: 0
  },
  colors: {
    background: NEUTRAL_7,
    error: ERROR,
    inputBackground: NEUTRAL_0,
    inputValueBackground: NEUTRAL_0,
    inputCursorColor: 'white',
    inputText: NEUTRAL_7,
    primary: PRIMARY,
    receivedMessageDocumentIcon: PRIMARY,
    secondary: SECONDARY,
    sentMessageDocumentIcon: NEUTRAL_7,
    userAvatarImageBackground: 'transparent',
    userAvatarNameColors: COLORS,
  },
  fonts: {
    dateDividerTextStyle: {
      color: NEUTRAL_2,
      fontSize: 12,
      fontWeight: '800',
      lineHeight: 16,
    },
    emptyChatPlaceholderTextStyle: {
      color: NEUTRAL_2,
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 24,
    },
    inputTextStyle: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 24,
    },
    receivedMessageBodyTextStyle: {
      color: NEUTRAL_0,
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 24,
    },
    receivedMessageCaptionTextStyle: {
      color: NEUTRAL_2,
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
    },
    receivedMessageLinkDescriptionTextStyle: {
      color: NEUTRAL_0,
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    receivedMessageLinkTitleTextStyle: {
      color: NEUTRAL_0,
      fontSize: 16,
      fontWeight: '800',
      lineHeight: 22,
    },
    sentMessageBodyTextStyle: {
      color: NEUTRAL_7,
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 24,
    },
    sentMessageCaptionTextStyle: {
      color: NEUTRAL_7_WITH_OPACITY,
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
    },
    sentMessageLinkDescriptionTextStyle: {
      color: NEUTRAL_7,
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    sentMessageLinkTitleTextStyle: {
      color: NEUTRAL_7,
      fontSize: 16,
      fontWeight: '800',
      lineHeight: 22,
    },
    userAvatarTextStyle: {
      color: NEUTRAL_7,
      fontSize: 12,
      fontWeight: '800',
      lineHeight: 16,
    },
    userNameTextStyle: {
      fontSize: 12,
      fontWeight: '800',
      lineHeight: 16,
    },
  },
  insets: {
    messageInsetsHorizontal: 20,
    messageInsetsVertical: 16,
  },
}

export const lightTheme: Theme = {
  borders: {
    inputBorderRadius: 5,
    messageBorderRadius: 20,
    chatTopRadius: 0
  },
  colors: {
    background: colors.palette.neutral100,
    secondary: colors.palette.gray600,
    error: ERROR,
    inputBackground: 'white',
    inputValueBackground: colors.palette.gray200,
    inputCursorColor: 'black',
    inputText: 'black',
    primary: colors.palette.gray200,
    receivedMessageDocumentIcon: colors.palette.gray600,
    sentMessageDocumentIcon: colors.palette.gray600,
    userAvatarImageBackground: 'transparent',
    userAvatarNameColors: COLORS,
  },
  fonts: {
    dateDividerTextStyle: {
      color: NEUTRAL_2,
      fontSize: 12,
      fontWeight: '800',
      lineHeight: 16,
    },
    emptyChatPlaceholderTextStyle: {
      // color: NEUTRAL_2,
      color: colors.palette.gray200,
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 20,
    },
    inputTextStyle: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
    },
    receivedMessageBodyTextStyle: {
      color: NEUTRAL_0,
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 24,
    },
    receivedMessageCaptionTextStyle: {
      color: NEUTRAL_2,
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
    },
    receivedMessageLinkDescriptionTextStyle: {
      color: NEUTRAL_0,
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    receivedMessageLinkTitleTextStyle: {
      color: colors.palette.gray600, color: NEUTRAL_0,
      fontSize: 16,
      fontWeight: '800',
      lineHeight: 18,
    },
    sentMessageBodyTextStyle: {
      color: colors.palette.gray600,
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 18,
    },
    sentMessageCaptionTextStyle: {
      color: NEUTRAL_7_WITH_OPACITY,
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
    },
    sentMessageLinkDescriptionTextStyle: {
      color: NEUTRAL_7,
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    sentMessageLinkTitleTextStyle: {
      color: NEUTRAL_7,
      fontSize: 16,
      fontWeight: '800',
      lineHeight: 22,
    },
    userAvatarTextStyle: {
      color: NEUTRAL_7,
      fontSize: 12,
      fontWeight: '800',
      lineHeight: 16,
    },
    userNameTextStyle: {
      fontSize: 12,
      fontWeight: '800',
      lineHeight: 16,
    },
  },
  insets: {
    messageInsetsHorizontal: 20,
    messageInsetsVertical: 16,
  },
}

/** Dark chat theme which implements {@link Theme} */
export const darkTheme: Theme = {
  borders: {
    inputBorderRadius: 10,
    messageBorderRadius: 20,
    chatTopRadius: 20
  },
  colors: {
    background: colors.palette.gray700,
    secondary: colors.palette.blue600,
    error: ERROR,
    inputBackground: colors.palette.gray700,
    inputValueBackground: colors.palette.gray600,
    inputCursorColor: 'white',
    inputText: NEUTRAL_7,
    primary: colors.palette.gray600,
    receivedMessageDocumentIcon: PRIMARY,
    sentMessageDocumentIcon: NEUTRAL_7,
    userAvatarImageBackground: 'transparent',
    userAvatarNameColors: COLORS,
  },
  fonts: {
    dateDividerTextStyle: {
      color: NEUTRAL_2,
      fontSize: 12,

      lineHeight: 16,
    },
    emptyChatPlaceholderTextStyle: {
      color: NEUTRAL_2,
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 24,
    },
    inputTextStyle: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 24,
    },
    receivedMessageBodyTextStyle: {
      color: NEUTRAL_0,
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 24,
    },
    receivedMessageCaptionTextStyle: {
      color: NEUTRAL_2,
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
    },
    receivedMessageLinkDescriptionTextStyle: {
      color: NEUTRAL_0,
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    receivedMessageLinkTitleTextStyle: {
      color: NEUTRAL_0,
      fontSize: 16,
      fontWeight: '800',
      lineHeight: 18,
    },
    sentMessageBodyTextStyle: {
      color: NEUTRAL_7,
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 18,
    },
    sentMessageCaptionTextStyle: {
      color: NEUTRAL_7_WITH_OPACITY,
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
    },
    sentMessageLinkDescriptionTextStyle: {
      color: NEUTRAL_7,
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    sentMessageLinkTitleTextStyle: {
      color: NEUTRAL_7,
      fontSize: 16,
      fontWeight: '800',
      lineHeight: 22,
    },
    userAvatarTextStyle: {
      color: NEUTRAL_7,
      fontSize: 12,
      fontWeight: '800',
      lineHeight: 16,
    },
    userNameTextStyle: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
      color: colors.palette.neutral100
    },
  },
  insets: {
    messageInsetsHorizontal: 20,
    messageInsetsVertical: 16,
  },
}

