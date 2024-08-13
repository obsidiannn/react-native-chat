import { oneOf } from '@flyerhq/react-native-link-preview'
import * as React from 'react'
import { GestureResponderEvent, Pressable, Text, View } from 'react-native'

import { MessageType } from '../../types'
import {
  excludeDerivedMessageProps,
  formatDate,
  ThemeContext,
  UserContext,
} from '../../utils'
import { Avatar } from '../Avatar'
import { FileMessage } from '../FileMessage'
import { ImageMessage } from '../ImageMessage'
import { StatusIcon } from '../StatusIcon'
import { TextMessage, TextMessageTopLevelProps } from '../TextMessage'
import styles from './styles'
import { VideoMessage } from '../VideoMessage'
import AvatarX from 'app/components/AvatarX'
import fileService from 'app/services/file.service'
import { s } from 'app/utils/size'

export interface MessageTopLevelProps extends TextMessageTopLevelProps {
  /** Called when user makes a long press on any message */
  onMessageLongPress?: (message: MessageType.Any, e: GestureResponderEvent) => void
  /** Called when user taps on any message */
  onMessagePress?: (message: MessageType.Any) => void
  /** Customize the default bubble using this function. `child` is a content
   * you should render inside your bubble, `message` is a current message
   * (contains `author` inside) and `nextMessageInGroup` allows you to see
   * if the message is a part of a group (messages are grouped when written
   * in quick succession by the same author) */
  renderBubble?: (payload: {
    child: React.ReactNode
    message: MessageType.Any
    nextMessageInGroup: boolean
  }) => React.ReactNode
  /** Render a custom message inside predefined bubble */
  renderCustomMessage?: (
    message: MessageType.Custom,
    messageWidth: number
  ) => React.ReactNode
  /** Render a file message inside predefined bubble */
  renderFileMessage?: (
    message: MessageType.File,
    messageWidth: number
  ) => React.ReactNode
  /** Render an image message inside predefined bubble */
  renderImageMessage?: (
    message: MessageType.Image,
    messageWidth: number
  ) => React.ReactNode
  /** Render a text message inside predefined bubble */
  renderTextMessage?: (
    message: MessageType.Text,
    messageWidth: number,
    showName: boolean
  ) => React.ReactNode
  /** Show user avatars for received messages. Useful for a group chat. */
  showUserAvatars?: boolean
}

export interface MessageProps extends MessageTopLevelProps {
  enableAnimation?: boolean
  message: MessageType.DerivedAny
  messageWidth: number
  roundBorder: boolean
  showAvatar: boolean
  showName: boolean
  showStatus: boolean
}

/** Base component for all message types in the chat. Renders bubbles around
 * messages and status. Sets maximum width for a message for
 * a nice look on larger screens. */
export const Message = React.memo(
  ({
    enableAnimation,
    message,
    messageWidth,
    onMessagePress,
    onMessageLongPress,
    onPreviewDataFetched,
    renderBubble,
    renderCustomMessage,
    renderFileMessage,
    renderImageMessage,
    renderTextMessage,
    roundBorder,
    showAvatar,
    showName,
    showStatus,
    showUserAvatars,
    usePreviewData,
  }: MessageProps) => {
    const theme = React.useContext(ThemeContext)
    const user = React.useContext(UserContext)

    const currentUserIsAuthor =
      message.type !== 'dateHeader' && user?.id === message.author.id

    const { container, contentContainer, dateHeader, pressable, messageBody, messageHeader } = styles({
      currentUserIsAuthor,
      message,
      messageWidth,
      roundBorder,
      theme,
    })
    // 日期拆分不用了
    // if (message.type === 'dateHeader') {
    //   return (
    //     <View style={dateHeader}>
    //       <Text style={theme.fonts.dateDividerTextStyle}>{message.text}</Text>
    //     </View>
    //   )
    // }
    if (message.type === 'dateHeader') {
      return null
    }
    message = message as MessageType.DerivedMessage
    const renderBubbleContainer = () => {
      const child = renderMessage()

      return oneOf(
        renderBubble,
        <View style={contentContainer} testID='ContentContainer' pointerEvents="none">
          {child}
        </View>
      )({
        child,
        message: excludeDerivedMessageProps(message),
        nextMessageInGroup: roundBorder,
      })
    }

    const renderMessage = () => {
      switch (message.type) {
        case 'custom':
          return (
            renderCustomMessage?.(
              // It's okay to cast here since we checked message type above
              // type-coverage:ignore-next-line
              excludeDerivedMessageProps(message) as MessageType.Custom,
              messageWidth
            ) ?? null
          )
        case 'file':
          return oneOf(renderFileMessage, <FileMessage {...{
            messageWidth,
            message

          }} />)(
            // type-coverage:ignore-next-line
            excludeDerivedMessageProps(message) as MessageType.File,
            messageWidth
          )
        case 'video':
          return oneOf(
            renderImageMessage,
            <VideoMessage
              {...{
                message,
                messageWidth,
              }}
            />
          )(
            // type-coverage:ignore-next-line
            excludeDerivedMessageProps(message) as MessageType.Image,
            messageWidth
          )
        case 'image':
          return oneOf(
            renderImageMessage,
            <ImageMessage
              {...{
                message,
                messageWidth,
              }}
            />
          )(
            // type-coverage:ignore-next-line
            excludeDerivedMessageProps(message) as MessageType.Image,
            messageWidth
          )
        case 'text':
          return oneOf(
            renderTextMessage,
            <TextMessage
              {...{
                enableAnimation,
                message,
                messageWidth,
                onPreviewDataFetched,
                showName,
                usePreviewData,
              }}
            />
          )(
            // type-coverage:ignore-next-line
            excludeDerivedMessageProps(message) as MessageType.Text,
            messageWidth,
            showName
          )
        default:
          return null
      }
    }

    return (
      <View style={container}>
        {
          currentUserIsAuthor ?
            <>
              <View style={messageBody}>
                <View style={messageHeader}>
                  <Text style={[theme.fonts.dateDividerTextStyle, { marginRight: 8 }]}>{formatDate(message.createdAt ?? 0)}</Text>
                  <Text style={theme.fonts.userNameTextStyle}>{message.author.firstName}</Text>
                </View>
                <View>

                  <Pressable
                    onStartShouldSetResponderCapture={(ev) => { return true }}
                    onLongPress={(e) => {
                      onMessageLongPress?.(excludeDerivedMessageProps(message), e)
                    }}
                    onPress={() => onMessagePress?.(excludeDerivedMessageProps(message))}
                    style={pressable}
                  >
                    {renderBubbleContainer()}
                  </Pressable>

                </View>
              </View>
              <View style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'space-between'
              }}>
                {/* 'delivered' | 'error' | 'seen' | 'sending' | 'sent' */}
                <Avatar
                  {...{
                    author: message.author,
                    currentUserIsAuthor,
                    showAvatar,
                    showUserAvatars,
                    theme,
                  }}
                />
                <View style={{
                  marginLeft: s(8),
                }}>
                  <StatusIcon
                    {...{
                      currentUserIsAuthor,
                      showStatus: true,
                      // status: message.status,
                      status: 'sending',
                      theme,
                    }}
                  />
                </View>
              </View>
            </>
            :
            (
              <>
                <Avatar
                  {...{
                    author: message.author,
                    currentUserIsAuthor,
                    showAvatar,
                    showUserAvatars,
                    theme,
                  }}
                />
                <View style={messageBody}>
                  <View style={messageHeader}>
                    <Text style={[theme.fonts.dateDividerTextStyle, { marginRight: 8 }]}>{formatDate(message.createdAt ?? 0)}</Text>
                    <Text style={theme.fonts.userNameTextStyle}>{message.author.firstName}</Text>
                  </View>
                  <Pressable
                    onStartShouldSetResponderCapture={(ev) => { return true }}
                    onLongPress={(e) => {
                      onMessageLongPress?.(excludeDerivedMessageProps(message), e)
                    }
                    }
                    onPress={() => onMessagePress?.(excludeDerivedMessageProps(message))}
                    style={pressable}
                  >
                    {renderBubbleContainer()}
                  </Pressable>
                </View>
              </>
            )
        }

      </View>
    )
  }
)
