import { Chat, MessageType, lightTheme, darkTheme } from "app/components/chat-ui"
import tools from "./tools"
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react"
import generateUtil from "app/utils/generateUtil"
import LongPressModal, { LongPressModalType } from "app/components/LongPressModal"
import { PreviewData } from "@flyerhq/react-native-link-preview"
import VideoPlayModal, { IVideoPreviewModal } from "app/components/VideoModal"
import FilePreviewModal, { ChatUIFileModalRef } from "app/components/FileModal"
import LoadingModal, { LoadingModalType } from "app/components/loading-modal"
import { useTranslation } from "react-i18next"
import { ChatDetailItem, DeleteMessageEvent, SocketJoinEvent, SocketMessageEvent } from "@repo/types"
import { IChat, IUser } from "drizzle/schema"
import { useRecoilValue } from "recoil"
import { AuthUser } from "app/stores/auth"

import EventManager from 'app/services/event-manager.service'
import { IModel } from "@repo/enums"
import messageSendService, { MessageSendService } from "app/services/message-send.service"
import chatUiAdapter from "app/utils/chat-ui.adapter"
import { ThemeState } from "app/stores/system"
import { LocalChatService } from "app/services/LocalChatService"
import { LocalMessageService } from "app/services/LocalMessageService"
import { Platform } from "react-native"
import { CloudMessageService } from "app/services/MessageService"
import { LocalUserService } from "app/services/LocalUserService"

export interface ChatUIPageRef {
    init: (chatItem: ChatDetailItem, friend: IUser) => void
    close: () => void
}

const ChatPage = forwardRef((_, ref) => {

    const firstSeq = useRef<number>(0)
    const lastSeq = useRef<number>(0)
    const remoteLastSeq = useRef<number>(0);
    const chatRef = useRef<IChat | null>(null);
    const friendRef = useRef<IUser | null>(null)
    const remoteMessageLoading = useRef<boolean>(false);
    // 加载历史数据 历史数据只会出现在本地
    const loadHistoryMessages = useCallback(async (chatId: string, seq: number) => {
        const items = await LocalMessageService.getList(chatId, seq, 20);
        setMessages(olds => {
            const tmps = [...olds, ...chatUiAdapter.messageEntityToItems(items)]
            firstSeq.current = tmps[tmps.length - 1].sequence;
            lastSeq.current = tmps[0].sequence;
            return tmps;
        })
    }, [])
    // 获取最新数据 也是从seq开始获取最近的 20 条
    const loadRemoteMessages = useCallback(async (chatId: string, seq: number) => {
        remoteMessageLoading.current = true;
        try {
            const ids = await CloudMessageService.getLatestIds(chatId, seq);
            const items = await CloudMessageService.findByIds(chatId, ids);
            setMessages(olds => {
                const tmps = [...olds, ...chatUiAdapter.messageEntityToItems(items)]
                firstSeq.current = tmps[tmps.length - 1].sequence;
                lastSeq.current = tmps[0].sequence;
                return tmps;
            })
            if (remoteLastSeq.current > lastSeq.current) {
                loadRemoteMessages(chatId, lastSeq.current);
            }
        } finally {
            remoteMessageLoading.current = false;
        }

    }, [])
    const loadChat = useCallback(async (chatId: string) => {
        chatRef.current = await LocalChatService.findById(chatId);
    }, [])
    const loadFriend = useCallback(async (friendId: number) => {
        friendRef.current = await LocalUserService.findById(friendId)
    }, [])
    const loadRemoteFriend = useCallback(async (friendId: number) => { }, [])
    const loadRemoteChat = useCallback(async (chatId: string) => {
        // 远程的数据
        // 并更新本地
        // 更新 remoteLastSeq
        if (remoteLastSeq.current > lastSeq.current) {
            loadRemoteMessages(chatId, lastSeq.current);
        }
    }, [])
    const theme = useRecoilValue(ThemeState)
    const author = useRecoilValue(AuthUser)

    const [messages, setMessages] = useState<MessageType.Any[]>([])
    const sharedSecretRef = useRef<string>('')
    const chatItemRef = useRef<ChatDetailItem | null>(null)

    const longPressModalRef = useRef<LongPressModalType>(null)
    const encVideoPreviewRef = useRef<IVideoPreviewModal>();
    const fileModalRef = useRef<ChatUIFileModalRef>(null)
    const loadingModalRef = useRef<LoadingModalType>(null)
    const { t } = useTranslation('screens')


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
            if (!message.roomId) {
                message.roomId = chatItemRef.current.id
            }
            if (message.metadata?.uidType) {
                message.metadata.uidType = 1
            }
            if (message.senderId) {
                message.senderId = author?.id ?? 0;
            }
            await LocalMessageService.addBatch(chatUiAdapter.messageEntityConverts([message]))
            LocalChatService.updateSequence(chatItemRef.current?.id, message.sequence)
        }
    }
    const addMessage = (message: MessageType.Any) => {
        const { sequence = 0 } = message
        if (sequence > lastSeq.current) {
            lastSeq.current = sequence
        }
        setMessages([message, ...messages])
        messageSendService.send(chatItemRef.current?.id ?? '', sharedSecretRef.current, message).then(updateMessage)
    }

    const init = useCallback(async (chatId: string, friendId: number) => {
        await loadChat(chatId);
        await loadFriend(friendId);
        await loadHistoryMessages(chatId, firstSeq.current);
        if (globalThis.wallet && friendRef.current) {
            sharedSecretRef.current = globalThis.wallet.computeSharedSecret(friendRef.current.pubKey);
        }
        // 判断网络是否在线
        if (true) {
            await loadRemoteMessages(chatId, firstSeq.current);
            await loadChat(chatId);
            await loadRemoteFriend(friendId);
            // 开始监听 socket 事件
            const _eventKey = EventManager.generateKey(IModel.IClient.SocketTypeEnum.MESSAGE, chatId)
            EventManager.addEventSingleListener(_eventKey, handleEvent)
            const _msg = { type: IModel.IClient.SocketTypeEnum.SOCKET_JOIN, chatIds: [chatId] } as SocketJoinEvent
            const eventKey = EventManager.generateKey(_msg.type, '')
            EventManager.emit(eventKey, _msg)
        }
    }, [])

    useImperativeHandle(ref, () => {
        return {
            init,
            close
        }
    })

    const close = useCallback(() => {
        const _eventKey = EventManager.generateKey(IModel.IClient.SocketTypeEnum.MESSAGE, chatRef.current?.id ?? '')
        EventManager.removeListener(_eventKey, handleEvent)
        setMessages([]);
        firstSeq.current = 0;
        lastSeq.current = 0;
    }, [])


    const handleEvent = (e: any) => {
        const { type } = e
        if (type === IModel.IClient.SocketTypeEnum.MESSAGE) {
            const _eventItem = e as SocketMessageEvent
            if (lastSeq.current < _eventItem.sequence && author?.id !== _eventItem.senderId) {
                console.log("socket 监听到新的消息了", Platform.OS)
                remoteLastSeq.current = _eventItem.sequence;
                if (!remoteMessageLoading.current) {
                    loadRemoteMessages(chatRef.current?.id ?? '', lastSeq.current);
                }
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

    const handleAttachmentPress = async (key: string) => {
        if (!author) {
            return;
        }
        switch (key) {
            case 'camera':
                MessageSendService.captureCamera(author).then(addMessage);
                break
            case 'video':
                loadingModalRef.current?.open(t('common.loading'))
                MessageSendService.captureVideo(author).then(addMessage).finally(() => {
                    loadingModalRef.current?.close()
                })
                break
            case 'albums':
                MessageSendService.imageSelection(author).then(addMessage);
                break
            case 'file':
                await MessageSendService.fileSelection(author).then(addMessage)
                break
            default: break
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
    }

    return <>
        <Chat
            tools={tools}
            messages={messages}
            onEndReached={async () => {
                loadHistoryMessages(chatItemRef.current?.id ?? '', firstSeq.current)
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