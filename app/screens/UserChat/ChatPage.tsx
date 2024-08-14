import { Chat, MessageType, lightTheme, darkTheme } from "app/components/chat-ui"
import tools from "./tools"
import { forwardRef, useCallback, useContext, useImperativeHandle, useRef, useState } from "react"
import generateUtil from "app/utils/generateUtil"
import LongPressModal, { LongPressModalType } from "app/components/LongPressModal"
import { PreviewData } from "@flyerhq/react-native-link-preview"
import VideoPlayModal, { IVideoPreviewModal } from "app/components/VideoModal"
import FilePreviewModal, { ChatUIFileModalRef } from "app/components/FileModal"
import LoadingModal, { LoadingModalType } from "app/components/loading-modal"
import { useTranslation } from "react-i18next"
import { ChatDetailItem, DeleteMessageEvent, SocketMessageEvent } from "@repo/types"
import { IUser } from "drizzle/schema"
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
import NetInfo from "@react-native-community/netinfo";
import { UserChatUIContext } from "./context"
import chatService from "app/services/chat.service"
import { LocalUserService } from "app/services/LocalUserService"
import userService from "app/services/user.service"
import eventUtil from "app/utils/event-util"
export interface ChatUIPageRef {
    init: (chatItem: ChatDetailItem, friend: IUser) => void
    refreshSequence: (firstSeq: number, lastSeq: number) => void
    close: () => void
}

const ChatPage = forwardRef((_, ref) => {
    const firstSeq = useRef<number>(0)
    const lastSeq = useRef<number>(0)
    const [messages, setMessages] = useState<MessageType.Any[]>([])
    const remoteLastSeq = useRef<number>(0);
    const remoteMessageLoading = useRef<boolean>(false);
    const userContext = useContext(UserChatUIContext)

    // 加载历史数据 历史数据只会出现在本地
    const loadHistoryMessages = useCallback(async (chatId: string, seq: number) => {
        let init = false
        if (seq < 0) {
            init = true
            seq = Number.MAX_VALUE
        }
        const items = await LocalMessageService.getList(chatId, seq, 10);
        console.log('【本地消息】', items);
        if (items.length > 0) {
            const userIds = items.map(i => i.uid)
            const users = await LocalUserService.findByIds(userIds)
            const userHash = userService.initUserHash(users)
            const tmps = items.map((e) => {
                const item = chatUiAdapter.messageEntity2Dto(e)
                const user = userHash.get(item?.senderId ?? -1)
                if (user) {
                    return {
                        ...item,
                        author: chatUiAdapter.userTransfer(user)
                    }
                }
                return item
            });
            setMessages(olds => {
                let result = []
                if (olds.length > 0) {
                    const oldMin = olds[olds.length - 1].sequence
                    result = olds.concat(tmps.filter(t => {
                        return t.sequence < oldMin
                    }))
                } else {
                    result = tmps
                }
                if (init) {
                    lastSeq.current = result[0].sequence
                }
                firstSeq.current = result[result.length - 1].sequence
                return result;
            })
        }
    }, [])
    // 获取最新数据 也是从seq开始获取最近的 20 条
    const loadRemoteMessages = useCallback(async (chatId: string, seq: number) => {
        if (remoteMessageLoading.current) {
            return;
        }
        remoteMessageLoading.current = true;
        try {
            const items = await CloudMessageService.getRemoteList(chatId, sharedSecretRef.current, seq, 20);
            if (items.length > 0) {
                setMessages(olds => {
                    let result = []
                    if (olds.length > 0) {
                        const oldMin = olds[olds.length - 1].sequence
                        result = items.filter(t => {
                            return t.sequence < oldMin
                        }).concat(olds)
                    } else {
                        result = items
                    }
                    firstSeq.current = result[result.length - 1].sequence
                    lastSeq.current = result[0].sequence
                    return result;
                })
            }

            if (remoteLastSeq.current > lastSeq.current) {
                loadRemoteMessages(chatId, lastSeq.current);
            }
        } finally {
            remoteMessageLoading.current = false;
        }

    }, [])

    const theme = useRecoilValue(ThemeState)
    const author = useRecoilValue(AuthUser)
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

    const init = useCallback(async (chatItem: ChatDetailItem, friend: IUser) => {
        const chatId = chatItem.id
        chatItemRef.current = chatItem
        await loadHistoryMessages(chatId, -1);
        if (globalThis.wallet && friend) {
            sharedSecretRef.current = globalThis.wallet.computeSharedSecret(friend.pubKey);
        }
        // 开始监听 socket 事件
        const _eventKey = EventManager.generateKey(IModel.IClient.SocketTypeEnum.MESSAGE, chatId)
        EventManager.addEventSingleListener(_eventKey, handleEvent)

        NetInfo.fetch().then(async (state) => {
            if (state.isConnected) {
                chatService.querySequence([chatId]).then(res => {
                    if (res.items.length > 0) {
                        remoteLastSeq.current = res.items[0].lastSequence
                        loadRemoteMessages(chatId, lastSeq.current);
                    }
                })
            }
        })
    }, [])

    useImperativeHandle(ref, () => {
        return {
            init,
            close
        }
    })

    const close = useCallback(() => {
        const chatId = chatItemRef.current?.id
        if (chatId) {
            const _eventKey = EventManager.generateKey(IModel.IClient.SocketTypeEnum.MESSAGE, chatId)
            EventManager.removeListener(_eventKey, handleEvent)
        }
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
                    loadRemoteMessages(chatItemRef.current?.id ?? '', lastSeq.current);
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

    const handleTypingChange = (v: boolean) => {
        eventUtil.sendTypeingEvent(chatItemRef.current?.id ?? '', v, author?.id ?? 0)
    }

    return <>
        <Chat
            tools={tools}
            messages={messages}
            onEndReached={() => loadHistoryMessages(chatItemRef.current?.id ?? '', firstSeq.current)}
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
            onTypingChange={handleTypingChange}
        />
        <LongPressModal ref={longPressModalRef} />
        <VideoPlayModal ref={encVideoPreviewRef} />
        <FilePreviewModal ref={fileModalRef} />
        <LoadingModal ref={loadingModalRef} />
    </>
})

export default ChatPage