import { Chat, MessageType, User, boboTheme } from "app/components/chat-ui"
import tools from "./tools"
import { useRef, useState } from "react"
import generateUtil from "app/utils/generateUtil"
import LongPressModal, { LongPressModalType } from "app/components/LongPressModal"
import { PreviewData } from "@flyerhq/react-native-link-preview"
import * as DocumentPicker from 'expo-document-picker';
import { MediaTypeOptions, launchImageLibraryAsync } from 'expo-image-picker'
import VideoPlayModal, { IVideoPreviewModal } from "app/components/VideoModal"
import FilePreviewModal, { ChatUIFileModalRef } from "app/components/FileModal"
import { captureVideo, videoFormat } from "app/utils/media-util"
import LoadingModal, { LoadingModalType } from "app/components/loading-modal"
import fileService from "app/services/file.service"
// import { translate } from "app/i18n"
import {generateVideoThumbnail} from 'app/utils/media-util'



const ChatPage = () => {
    const [messages, setMessages] = useState<MessageType.Any[]>([])
    const longPressModalRef = useRef<LongPressModalType>(null)
    const encVideoPreviewRef = useRef<IVideoPreviewModal>();
    const fileModalRef = useRef<ChatUIFileModalRef>(null)
    const loadingModalRef = useRef<LoadingModalType>(null)
    
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

    const handleAttachmentPress = async (key: string) => {
        switch (key) {
            case 'camera':
                // handleCamera()
                break
            case 'video':
                handleVideo()
                break
            case 'albums':
                handleImageSelection()
                break
            case 'file':
                handleFileSelection()
                break
            default: break
        }
    }


    // 发送文件
    const handleFileSelection = async () => {
        try {
            //   const response = await DocumentPicker.pickSingle({
            //     type: [DocumentPicker.types.allFiles],
            //   })
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });
            if (result.assets !== null && result.assets.length > 0) {
                const response = result.assets[0]
                const fileMessage: MessageType.File = {
                    // author: chatUiAdapter.userTransfer(author),
                    author: author,
                    createdAt: Date.now(),
                    id: generateUtil.generateId(),
                    mimeType: response.mimeType ?? undefined,
                    name: response.name,
                    size: response.size ?? 0,
                    type: 'file',
                    uri: response.uri,
                    senderId: author.id,
                    sequence: -1,
                    status: 'sending'
                }
                addMessage(fileMessage)
                // messageSendService.send(chatItemRef.current?.id ?? '', sharedSecretRef.current, fileMessage)
                //     .then(res => {
                //         updateMessage(res)
                //     })
            }

        } catch { }
    }

    /**
     * 发送图片
     */
    const handleImageSelection = async () => {
        const result = await launchImageLibraryAsync(
            {
                mediaTypes: MediaTypeOptions.Images,
                quality: 0.7,
                base64: true,
            }
        )
        const assets = result.assets
        const response = assets?.[0]

        if (response?.base64) {
            const imageMessage: MessageType.Image = {
                // author: chatUiAdapter.userTransfer(author),
                author,
                createdAt: Date.now(),
                height: response.height,
                id: generateUtil.generateId(),
                name: response.fileName ?? response.uri?.split('/').pop() ?? '🖼',
                size: response.fileSize ?? 0,
                type: 'image',
                // uri: `data:image/*;base64,${response.base64}`,
                uri: response.uri,
                width: response.width,
                senderId: author.id,
                sequence: -1
            }
            addMessage(imageMessage)
            // messageSendService.send(chatItemRef.current?.id ?? '', sharedSecretRef.current, imageMessage)
            //     .then(res => {
            //         updateMessage(res)
            //     })
        }

    }

    // /**
    //  * 拍照处理
    //  */
    // const handleCamera = async () => {
    //     const photo = await captureImage();
    //     if (photo !== undefined) {
    //         const imageMessage: MessageType.Image = {
    //             // author: chatUiAdapter.userTransfer(author),
    //             author,
    //             createdAt: Date.now(),
    //             height: photo.height,
    //             id: generateUtil.generateId(),
    //             name: photo.fileName ?? '',
    //             size: photo.fileSize ?? 0,
    //             type: 'image',
    //             // uri: `data:image/*;base64,${photo.base64}`,
    //             uri: photo.uri,
    //             width: photo.width,
    //             senderId: author.id,
    //             sequence: -1
    //         }
    //         addMessage(imageMessage)
    //         // messageSendService.send(chatItemRef.current?.id ?? '', sharedSecretRef.current, imageMessage)
    //         //     .then(res => {
    //         //         updateMessage(res)
    //         //     })
    //     }
    // }

    const handleMessagePress = async (message: MessageType.Any) => {
        console.log(message);

        if (message.type === 'file') {
            fileModalRef.current?.open({
                encKey: '',
                file: message
            })
        }
        if (message.type === 'video') {
            encVideoPreviewRef.current?.open({
                encKey: '',
                video: message
            })
        }
    }

    /**
     * video处理
     */
    const handleVideo = async () => {
        const video = await captureVideo();
        if (video !== undefined && video !== null) {
            loadingModalRef.current?.open(translate('common.loading'))
            try {
                const formatVideo = await videoFormat(video)
                if (formatVideo !== null) {
                    const mid = generateUtil.generateId()
                    const thumbnailPath = await generateVideoThumbnail(formatVideo.uri, mid)
                    const message: MessageType.Video = {
                        id: generateUtil.generateId(),
                        // author: chatUiAdapter.userTransfer(author),
                        author,
                        createdAt: Date.now(),
                        type: 'video',
                        senderId: author.id,
                        sequence: -1,
                        height: formatVideo.height,
                        width: formatVideo.width,
                        name: formatVideo.fileName ?? '',
                        size: formatVideo.fileSize ?? 0,
                        duration: formatVideo.duration ?? 0,
                        uri: formatVideo.uri,
                        thumbnail: thumbnailPath ?? '',
                        status: 'sending'
                    }
                    addMessage(message)
                    // messageSendService.send(chatItemRef.current?.id ?? '', sharedSecretRef.current, message)
                    //     .then(res => {
                    //         updateMessage(res)
                    //     })
                }
            } finally {
                loadingModalRef.current?.close()
            }
        }
    }

    const handlePreviewDataFetched = ({
        message,
        previewData,
    }: {
        message: MessageType.Text
        previewData: PreviewData
    }) => {
        setMessages(
            messages.map<MessageType.Any>((m) =>
                m.id === message.id ? { ...m, previewData } : m
            )
        )
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
            showUserNames
            onMessageLongPress={(m, e) => {
                longPressModalRef.current?.open({ message: m, e })
            }}
            // onMessageLongPress={handleLongPress}
            usePreviewData={false}
            theme={boboTheme}
            onAttachmentPress={handleAttachmentPress}
            onMessagePress={handleMessagePress}
            onPreviewDataFetched={handlePreviewDataFetched}
            onSendPress={handleSendPress}
            user={author}
        />
        <LongPressModal ref={longPressModalRef} />
        <VideoPlayModal ref={encVideoPreviewRef} />
        <FilePreviewModal ref={fileModalRef} />
        <LoadingModal ref={loadingModalRef} />
    </>
}

export default ChatPage