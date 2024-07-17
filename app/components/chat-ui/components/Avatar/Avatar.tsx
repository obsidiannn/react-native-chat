import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { MessageType, Theme } from '../../types'
import { getUserAvatarNameColor, getUserInitials } from '../../utils'

export const Avatar = React.memo(
  ({
    author,
    currentUserIsAuthor,
    showAvatar,
    showUserAvatars,
    theme,
  }: {
    author: MessageType.Any['author']
    currentUserIsAuthor: boolean
    showAvatar: boolean
    showUserAvatars?: boolean
    theme: Theme
  }) => {
    const renderAvatar = () => {
      const color = getUserAvatarNameColor(
        author,
        theme.colors.userAvatarNameColors
      )
      const initials = getUserInitials(author)

      if (author.imageUrl) {

        return (
          <Image
            accessibilityRole='image'
            source={{ uri: author.imageUrl }}
            style={
              {
                ...styles.image,
                backgroundColor: theme.colors.userAvatarImageBackground
              }}
          />
        )
      } else {
        console.log('miss avatar: ', author);
      }

      return (
        <View style={[styles.avatarBackground, { backgroundColor: 'gray' }]}>
          <Text style={theme.fonts.userAvatarTextStyle}>{initials}</Text>
        </View>
      )
    }

    return showUserAvatars ? (
      <View testID='AvatarContainer' style={{
        ...(currentUserIsAuthor ? { marginLeft: 16 } : { marginRight: 16 })
      }}>
        {showAvatar ? renderAvatar() : <View style={styles.placeholder} />}
      </View>
    ) : null
  }
)

const styles = StyleSheet.create({
  avatarBackground: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    width: 48,
    justifyContent: 'center',
  },
  image: {
    alignItems: 'center',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
})
