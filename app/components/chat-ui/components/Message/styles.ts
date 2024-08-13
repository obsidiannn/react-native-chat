import { StyleSheet } from 'react-native'

import { MessageType, Theme } from '../../types'

const styles = ({
  currentUserIsAuthor,
  message,
  messageWidth,
  roundBorder,
  theme,
}: {
  currentUserIsAuthor: boolean
  message: MessageType.DerivedAny
  messageWidth: number
  roundBorder: boolean
  theme: Theme
}) =>
  StyleSheet.create({
    container: {
      alignItems: 'flex-start',
      alignSelf: currentUserIsAuthor ? 'flex-end' : 'flex-start',
      justifyContent: !currentUserIsAuthor ? 'flex-end' : 'flex-start',
      flex: 1,
      marginBottom: message.type === 'dateHeader' ? 0 : 8 + message.offset,
      marginLeft: 20,
      flexDirection: 'row',
    },
    contentContainer: {
      backgroundColor:
        !currentUserIsAuthor || message.type === 'image'
          ? theme.colors.receivedMessageBackground
          : theme.colors.sentMessageBackground,
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
    },
    dateHeader: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 32,
      marginTop: 16,
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
      padding: 4
    }
  })

export default styles
