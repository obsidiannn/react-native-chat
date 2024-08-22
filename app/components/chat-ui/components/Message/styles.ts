import { Platform, StyleSheet } from 'react-native'

import { MessageType, Theme } from '../../types'
import { s, vs } from 'app/utils/size'

const styles = ({
  currentUserIsAuthor,
  message,
  messageWidth,
  roundBorder,
  theme,
  enableMultiSelect,
  checked
}: {
  currentUserIsAuthor: boolean
  message: MessageType.DerivedAny
  messageWidth: number
  roundBorder: boolean
  theme: Theme
  enableMultiSelect: boolean,
  checked: boolean
}) =>
  StyleSheet.create({
    container: {
      alignSelf: currentUserIsAuthor ? 'flex-end' : 'flex-start',
      justifyContent: currentUserIsAuthor ? (
        enableMultiSelect ? 'space-between' : 'flex-end'
      ) : 'flex-start',
      flex: 1,
      marginBottom: message.type === 'dateHeader' ? 0 : 8 + message.offset,
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
    },
    contentContainer: {
      backgroundColor:
        checked ? theme.colors.pressed : (
          !currentUserIsAuthor || message.type === 'image'
            ? theme.colors.receivedMessageBackground
            : theme.colors.sentMessageBackground
        )
      ,
      borderTopLeftRadius:
        currentUserIsAuthor || roundBorder
          ? theme.borders.messageBorderRadius
          : 0,
      borderTopRightRadius: currentUserIsAuthor
        ? roundBorder
          ? theme.borders.messageBorderRadius
          : 0
        : theme.borders.messageBorderRadius,
      borderColor: 'transparent',
      borderRadius: theme.borders.messageBorderRadius,
      overflow: 'hidden',
      alignSelf: currentUserIsAuthor ? 'flex-end' : 'flex-start',
      ...(message.type === 'userCard' ? Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
        },
        android: {
          elevation: 10,
        },
      }) : null)
    },
    dateHeader: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: vs(32),
      marginTop: vs(16),
    },
    pressable: {
      maxWidth: messageWidth,
    },
    messageBody: {
    },
    messageHeader: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: s(4)
    }
  })

export default styles
