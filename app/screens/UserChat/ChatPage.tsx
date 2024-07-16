import { Chat, MessageType, User, boboTheme } from "app/components/chat-ui"
import tools from "./tools"
import { useRef, useState } from "react"
import generateUtil from "app/utils/generateUtil"
import LongPressModal, { LongPressModalType } from "app/components/LongPressModal"
import { View } from "react-native"

const ChatPage = () => {
    const [messages, setMessages] = useState<MessageType.Any[]>([])
    const longPressModalRef = useRef<LongPressModalType>(null)
    const author: User = {
        id: "1",
        createdAt: 0,
        firstName: 'sub',
        imageUrl: 'https://i3.hoopchina.com.cn/user/865/194528590988865/194528590988865-1580107402.jpeg',
        role: 'admin'
    }
    const addMessage = (message: MessageType.Any) => {
        // const { sequence = 0 } = message
        // if (sequence > lastSeq.current) {
        //     lastSeq.current = sequence
        // }
        // console.log('------add message', sequence);
        setMessages([message, ...messages])
    }

    const handleSendPress = (message: MessageType.PartialText) => {
        const textMessage: MessageType.Text = {
            // author: chatUiAdapter.userTransfer(author),
            author: author,
            createdAt: Date.now(),
            id: generateUtil.generateId(),
            text: message.text,
            type: 'text',
            senderId: 1,
            sequence: -1
        }
        addMessage(textMessage)

        // console.log("新增消息",textMessage);
        // addMessage(textMessage)
        // messageSendService.send(chatItemRef.current?.id ?? '', sharedSecretRef.current, textMessage)
        //     .then(res => {
        //         console.log('message', res);
        //         updateMessage(res)
        //     })
    }

    return <>
        <Chat
            tools={tools}
            messages={messages}
            onEndReached={async () => {
                // loadMessages('up')
            }}
            showUserAvatars
            onMessageLongPress={(m, e) => {
                longPressModalRef.current?.open({ message: m, e })
            }}
            // onMessageLongPress={handleLongPress}
            usePreviewData={false}
            theme={boboTheme}
            // onAttachmentPress={handleAttachmentPress}
            // onMessagePress={handleMessagePress}
            // onPreviewDataFetched={handlePreviewDataFetched}
            onSendPress={handleSendPress}
            user={author}
        />

        {/* <LongPressModal ref={longPressModalRef} />
        <VideoPlayModal ref={encVideoPreviewRef} />
        <FilePreviewModal ref={fileModalRef} />
        <LoadingModal ref={loadingModalRef} /> */}

        <LongPressModal ref={longPressModalRef} />
    </>
}

export default ChatPage