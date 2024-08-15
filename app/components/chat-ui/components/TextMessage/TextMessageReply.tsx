import { Text } from "react-native"
import { MessageType } from '../../types'
import { s } from "app/utils/size"
export const TextMessageReply = (props: {
    message: MessageType.Any
}) => {
    const replyMsg = props.message as MessageType.Text
    return <Text style={{
        paddingVertical: s(4)
    }}>
        {replyMsg.text}
    </Text>
}