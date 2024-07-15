import { EmptyComponent } from "app/components/EmptyComponent"
import { scale } from "app/utils/size"
import { Image } from "expo-image"
import { useState } from "react"
import { StyleSheet, Text, View, ActivityIndicator } from "react-native"


const ChatView = () => {

    const [chats, setChats] = useState([])
    const [loading, setLoading] = useState<boolean>(true)

    const renderState = () => {
        if (loading) {
            return <ActivityIndicator size="large" />
        } else {
            return chats.length <= 0 ? <EmptyComponent /> : null
        }
    }

    return <>
        <View style={styles.container}>
            {renderState()}
        </View>
    </>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: scale(12)
    }
})

export default ChatView

