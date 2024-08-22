import { StyleSheet } from 'react-native'
import { MessageType, Theme, User } from '../../types'
import { s, vs } from 'app/utils/size'

const styles = ({
    message,
    theme,
    user,
}: {
    message: MessageType.UserCard
    theme: Theme
    user?: User
}) =>
    StyleSheet.create({
        minimizedImageContainer: {
            display: 'flex',
            paddingHorizontal: s(12),
            backgroundColor:
                user?.id === message.author.id
                    ? theme.colors.background
                    : theme.colors.secondary,
            borderRadius: s(12),
        },

    })

export default styles
