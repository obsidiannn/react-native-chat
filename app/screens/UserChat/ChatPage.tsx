import { Chat, MessageType, lightTheme, darkTheme } from "app/components/chat-ui"
import tools from "./tools"
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react"
import generateUtil from "app/utils/generateUtil"
import LongPressModal, { LongPressModalType } from "app/components/LongPressModal"
import { PreviewData } from "@flyerhq/react-native-link-preview"
import * as DocumentPicker from 'expo-document-picker';
import { MediaTypeOptions, launchImageLibraryAsync } from 'expo-image-picker'
import VideoPlayModal, { IVideoPreviewModal } from "app/components/VideoModal"
import FilePreviewModal, { ChatUIFileModalRef } from "app/components/FileModal"
import { captureImage, captureVideo, videoFormat } from "app/utils/media-util"
import LoadingModal, { LoadingModalType } from "app/components/loading-modal"
import { generateVideoThumbnail } from 'app/utils/media-util'
import { useTranslation } from "react-i18next"
import { ChatDetailItem, DeleteMessageEvent, SocketJoinEvent, SocketMessageEvent } from "@repo/types"
import { IUser } from "drizzle/schema"
import { useRecoilValue } from "recoil"
import { AuthUser } from "app/stores/auth"

import EventManager from 'app/services/event-manager.service'
import { IModel } from "@repo/enums"
import messageSendService from "app/services/message-send.service"
import chatUiAdapter from "app/utils/chat-ui.adapter"
import { ThemeState } from "app/stores/system"
import chatService from "app/services/chat.service"
import { LocalChatService } from "app/services/LocalChatService"
import { LocalMessageService } from "app/services/LocalMessageService"

export interface ChatUIPageRef {
    init: (chatItem: ChatDetailItem, friend: IUser) => void
    close: () => void
}

const ChatPage = forwardRef((_, ref) => {
    const theme = useRecoilValue(ThemeState)
    const author = useRecoilValue(AuthUser)

    const [messages, setMessages] = useState<MessageType.Any[]>([])
    const friendRef = useRef<IUser | null>(null)
    const firstSeq = useRef<number>(0)
    const lastSeq = useRef<number>(0)
    const sharedSecretRef = useRef<string>('')
    const chatItemRef = useRef<ChatDetailItem | null>(null)

    const longPressModalRef = useRef<LongPressModalType>(null)
    const encVideoPreviewRef = useRef<IVideoPreviewModal>();
    const fileModalRef = useRef<ChatUIFileModalRef>(null)
    const loadingModalRef = useRef<LoadingModalType>(null)
    const { t } = useTranslation('screens')

    const addMessage = (message: MessageType.Any) => {
        const { sequence = 0 } = message
        if (sequence > lastSeq.current) {
            lastSeq.current = sequence
        }
        console.log('------add message', sequence);
        setMessages([message, ...messages])
    }

    const updateMessage = async (message: MessageType.Any) => {
        if (message.sequence > lastSeq.current) {
            lastSeq.current = message.sequence
        }
        setMessages(items => {
            for (let index = items.length - 1; index >= 0; index--) {
                const item = items[index]
                if (item.id === message.id) {
                    items[index] = { ...message }
                    break
                }
            }
            return items;
        })
        if (chatItemRef.current) {
            if(!message.roomId){
                message.roomId = chatItemRef.current.id
            }
            if(message.metadata?.uidType){
                message.metadata.uidType =1
            }
            if(message.senderId){
                message.senderId = author?.id ?? 0;
            }
            await LocalMessageService.saveBatchEntity(chatUiAdapter.messageEntityConverts([message]))
            LocalChatService.updateSequence(chatItemRef.current?.id, message.sequence)
        }
    }

    const init = useCallback((chatItem: ChatDetailItem, friend: IUser) => {
        if (!globalThis.wallet) {
            return
        }
        console.log('[chatui] init before', chatItem);
        if (chatItem === null || chatItem === undefined) {
            return
        }
        console.log('[chatui] init', chatItem);
        console.log('[chatui] friend', friend);
        console.log(sharedSecretRef.current);

        if (sharedSecretRef.current) {
            return
        }
        chatItemRef.current = chatItem
        friendRef.current = friend
        sharedSecretRef.current = globalThis.wallet.computeSharedSecret(friend?.pubKey ?? '');
        const _eventKey = EventManager.generateKey(IModel.IClient.SocketTypeEnum.MESSAGE, chatItem.id)
        EventManager.addEventSingleListener(_eventKey, handleEvent)

        const _msg = { type: IModel.IClient.SocketTypeEnum.SOCKET_JOIN, chatIds: [chatItem.id] } as SocketJoinEvent
        const eventKey = EventManager.generateKey(_msg.type, '')
        EventManager.emit(eventKey, _msg)

        messageLoad(chatItem)
    }, [])

    useImperativeHandle(ref, () => {
        return {
            init, close
        }
    })

    const close = useCallback(() => {
        console.log('销毁');
        const _eventKey = EventManager.generateKey(IModel.IClient.SocketTypeEnum.MESSAGE, chatItemRef.current?.id ?? '')
        EventManager.removeListener(_eventKey, handleEvent)
        setMessages([]);
        firstSeq.current = 0;
        lastSeq.current = 0;
    }, [])


    const messageLoad = async (_chatItem: ChatDetailItem) => {
        const localChat = await LocalChatService.findById(_chatItem.id);
        firstSeq.current = localChat?.firstSequence ?? 0;
        lastSeq.current = localChat?.lastSequence ?? 0
        console.log('[userchat]load local');
        await loadMessages('up', true);
        try {
            console.log('刷新chat');
            const oldSeq = _chatItem.lastSequence
            const newChatItem = await chatService.refreshSequence([_chatItem])
            _chatItem = newChatItem[0]
            // 有未讀
            const limit = _chatItem.lastSequence - oldSeq
            if (limit > 0) {
                console.log('[userchat]load remote');
                loadMessages('down', false, limit);
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleEvent = (e: any) => {
        const { type } = e
        console.log('[event]', e);
        if (type === IModel.IClient.SocketTypeEnum.MESSAGE) {
            const _eventItem = e as SocketMessageEvent
            if (lastSeq.current < _eventItem.sequence && author?.id !== _eventItem.senderId) {
                console.log("socket 监听到新的消息了")
                loadMessages('down')
            }
        }
        if (type === IModel.IClient.SocketTypeEnum.CLEAR_ALL_MESSAGE) {
            setMessages([])
        }
        if (type === IModel.IClient.SocketTypeEnum.DELETE_MESSAGE) {
            const _eventItem = e as DeleteMessageEvent
            if (_eventItem.msgIds && _eventItem.msgIds.length > 0) {
                setMessages((items) => {
                    return items.filter(i => !_eventItem.msgIds.includes(i.id))
                })
            }
        }
    }



    const loadMessages = useCallback(async (direction: 'up' | 'down', init?: boolean, limit?: number) => {
        if (!chatItemRef.current) {
            return
        }
        let seq = direction == 'up' ? firstSeq.current : lastSeq.current;
        if (!init) {
            if (direction === 'up') {
                seq -= 1
                if (seq <= (firstSeq.current)) {
                    return
                }
            } else {
                seq += 1
            }
        }
        console.log('load', direction, firstSeq.current , lastSeq.current);

        return messageSendService.getList(
            chatItemRef.current.id,
            sharedSecretRef.current,
            seq,
            direction,
            firstSeq.current,
            init,
            limit
        ).then((res) => {
            if (res.length <= 0) {
                return
            }
            const ls = res[0].sequence ?? 0
            const fs = res[res.length - 1].sequence ?? 0
            let _data: any[] = []
            if (direction === 'up') {
                if (!init && firstSeq.current <= fs) {
                    return
                } else {
                    _data = res.filter(r => {
                        if (init) {
                            return true
                        }
                        return (r.sequence ?? 0) < firstSeq.current
                    })
                    firstSeq.current = fs
                    if (_data.length > 0) {
                        if (init) {
                            setMessages(_data);
                        } else {
                            setMessages((items) => {
                                return items.concat(_data);
                            });
                        }
                    }
                }
            }
            if (direction === 'down') {
                if (lastSeq.current >= ls) {
                    return
                } else {
                    _data = res.filter(r => {
                        if (init) {
                            return true
                        }
                        return (r.sequence ?? 0) > lastSeq.current
                    })
                    lastSeq.current = ls
                    if (_data.length > 0) {
                        console.log('[add data]', _data);
                        setMessages((items) => {
                            const exitIds = items.map((i) => i.id)
                            return _data.filter((i) => {
                                return !exitIds.includes(i.id)
                            }).concat(items);
                        });
                        // messageListRef.current?.scrollToIndex(lastSeq.current)
                    }
                }
            }
        }).catch((err) => {
            console.log('message load error', err);
        }).finally(() => {
            // loadingRef.current = false;
        })
    }, [])


    const handleAttachmentPress = async (key: string) => {
        switch (key) {
            case 'camera':
                handleCamera()
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

    /**
     * 拍照处理
     */
    const handleCamera = async () => {
        const photo = await captureImage();
        if (photo !== undefined) {
            const imageMessage: MessageType.Image = {
                author: chatUiAdapter.userTransfer(author),
                createdAt: Date.now(),
                height: photo.height,
                id: generateUtil.generateId(),
                name: photo.fileName ?? '',
                size: photo.fileSize ?? 0,
                type: 'image',
                uri: photo.uri,
                width: photo.width,
                senderId: author?.id ?? 0,
                sequence: -1
            }
            addMessage(imageMessage)
            messageSendService.send(chatItemRef.current?.id ?? '', sharedSecretRef.current, imageMessage)
                .then(res => {
                    updateMessage(res)
                })
        }
    }


    /**
     * video处理
     */
    const handleVideo = async () => {
        const video = await captureVideo();
        if (video !== undefined && video !== null) {
            loadingModalRef.current?.open(t('common.loading'))
            try {
                const formatVideo = await videoFormat(video)
                if (formatVideo !== null) {
                    const mid = generateUtil.generateId()
                    const thumbnailPath = await generateVideoThumbnail(formatVideo.uri, mid)
                    const message: MessageType.Video = {
                        id: generateUtil.generateId(),
                        author: chatUiAdapter.userTransfer(author),
                        createdAt: Date.now(),
                        type: 'video',
                        senderId: author?.id ?? 0,
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
                    messageSendService.send(chatItemRef.current?.id ?? '', sharedSecretRef.current, message)
                        .then(res => {
                            updateMessage(res)
                        })
                }
            } finally {
                loadingModalRef.current?.close()
            }
        }
    }

    // 发送文件
    const handleFileSelection = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });
            if (result.assets !== null && result.assets.length > 0) {
                const response = result.assets[0]
                const fileMessage: MessageType.File = {
                    author: chatUiAdapter.userTransfer(author),
                    createdAt: Date.now(),
                    id: generateUtil.generateId(),
                    mimeType: response.mimeType ?? undefined,
                    name: response.name,
                    size: response.size ?? 0,
                    type: 'file',
                    uri: response.uri,
                    senderId: author?.id ?? 0,
                    sequence: -1,
                    status: 'sending'
                }
                addMessage(fileMessage)
                messageSendService.send(chatItemRef.current?.id ?? '', sharedSecretRef.current, fileMessage)
                    .then(res => {
                        updateMessage(res)
                    })
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
                author: chatUiAdapter.userTransfer(author),
                createdAt: Date.now(),
                height: response.height,
                id: generateUtil.generateId(),
                name: response.fileName ?? response.uri?.split('/').pop() ?? '🖼',
                size: response.fileSize ?? 0,
                type: 'image',
                uri: response.uri,
                width: response.width,
                senderId: author?.id ?? 0,
                sequence: -1
            }
            addMessage(imageMessage)
            messageSendService.send(chatItemRef.current?.id ?? '', sharedSecretRef.current, imageMessage)
                .then(res => {
                    updateMessage(res)
                })
        }

    }

    const handleMessagePress = async (message: MessageType.Any) => {

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
            author: chatUiAdapter.userTransfer(author),
            createdAt: Date.now(),
            id: generateUtil.generateId(),
            text: message.text,
            type: 'text',
            senderId: 1,
            sequence: -1
        }
        addMessage(textMessage)
        console.log("新增消息", textMessage);
        addMessage(textMessage)
        messageSendService.send(chatItemRef.current?.id ?? '', sharedSecretRef.current, textMessage)
            .then(res => {
                updateMessage(res)
            })
    }

    return <>
        <Chat
            tools={tools}
            messages={messages}
            onEndReached={async () => {
                loadMessages('down')
            }}
            showUserAvatars
            onMessageLongPress={(m, e) => {
                longPressModalRef.current?.open({ message: m, e })
            }}
            usePreviewData={false}
            theme={theme === 'dark' ? darkTheme : lightTheme}
            onAttachmentPress={handleAttachmentPress}
            onMessagePress={handleMessagePress}
            onPreviewDataFetched={handlePreviewDataFetched}
            onSendPress={handleSendPress}
            user={chatUiAdapter.userTransfer(author)}
        />
        <LongPressModal ref={longPressModalRef} />
        <VideoPlayModal ref={encVideoPreviewRef} />
        <FilePreviewModal ref={fileModalRef} />
        <LoadingModal ref={loadingModalRef} />
    </>
})

export default ChatPage