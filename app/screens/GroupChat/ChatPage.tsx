import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import tools from './tools';
import {
    ChatDetailItem, DeleteMessageEvent,
    SocketMessageEvent,
    GroupDetailItem
} from "@repo/types";
import EventManager from 'app/services/event-manager.service'
import { useTranslation } from 'react-i18next';
import { Chat, MessageType, darkTheme, lightTheme } from "app/components/chat-ui";
import chatUiAdapter from "app/utils/chat-ui.adapter";
import { useRecoilValue } from "recoil";
import messageSendService, { MessageSendService } from "app/services/message-send.service";
import { PreviewData } from "@flyerhq/react-native-link-preview";
import VideoPlayModal, { IVideoPreviewModal } from "app/components/VideoModal"
import FilePreviewModal, { ChatUIFileModalRef } from "app/components/FileModal"
import LongPressModal, { LongPressModalType } from "app/components/LongPressModal";
import LoadingModal, { LoadingModalType } from 'app/components/loading-modal';

import { IModel } from "@repo/enums";
import { AuthUser } from "app/stores/auth";
import quickCrypto from "app/utils/quick-crypto";
import generateUtil from "app/utils/generateUtil";
import { GestureResponderEvent } from "react-native";
import { ThemeState } from "app/stores/system";
import chatService from "app/services/chat.service";
import eventUtil from "app/utils/event-util";
import { LocalMessageService } from "app/services/LocalMessageService";
import { CloudMessageService } from "app/services/MessageService";
import NetInfo from "@react-native-community/netinfo";
import { LocalChatService } from "app/services/LocalChatService";

export interface GroupChatPageRef {
    init: (
        chatItem: ChatDetailItem,
        group: GroupDetailItem,
    ) => void;
    close: () => void;
}
export default forwardRef((_, ref) => {
    const [messages, setMessages] = useState<MessageType.Any[]>([])
    const chatItemRef = useRef<ChatDetailItem>()
    const author = useRecoilValue(AuthUser)
    const sharedSecretRef = useRef<string>('');

    const firstSeq = useRef<number>(0);
    const lastSeq = useRef<number>(0);
    const remoteMessageLoading = useRef<boolean>(false)
    const remoteLastSeq = useRef<number>(0)

    const encVideoPreviewRef = useRef<IVideoPreviewModal>();
    const longPressModalRef = useRef<LongPressModalType>();
    const loadingModalRef = useRef<LoadingModalType>(null)
    const fileModalRef = useRef<ChatUIFileModalRef>()
    const theme = useRecoilValue(ThemeState)
    const { t } = useTranslation('screen-group-chat')


    const addMessage = (message: MessageType.Any) => {
        const { sequence = 0 } = message
        if (sequence > lastSeq.current) {
            lastSeq.current = sequence
        }
        console.log('------add message', sequence);
        setMessages([message, ...messages])
        messageSendService.send(chatItemRef.current?.id ?? '', sharedSecretRef.current, message)
            .then(updateMessage)
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

    // 加载历史数据 历史数据只会出现在本地
    const loadHistoryMessages = useCallback(async (chatId: string, seq: number) => {
        let init = false
        if (seq < 0) {
            init = true
            seq = Number.MAX_VALUE
        }
        const items = await LocalMessageService.getList(chatId, seq, 20);
        console.log('【本地消息】', items);

        if (items.length > 0) {
            setMessages(olds => {
                const tmps = chatUiAdapter.messageEntityToItems(items)
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

    const init = useCallback(async (
        chatItem: ChatDetailItem,
        group: GroupDetailItem
    ) => {
        if (chatItem === null || chatItem === undefined) {
            return
        }
        if (author === undefined) {
            console.error('self member error')
            return;
        }
        const myWallet = globalThis.wallet
        if (myWallet === null || myWallet === undefined) {
            return
        }
        console.log('會話id conversationIdRef', chatItem.id)
        console.log('author=', author);
        const chatId = chatItem.id
        let sharedSecret: string
        if (group?.encPri !== '' && group?.encPri !== null && group?.encPri !== undefined) {
            console.log('[groupa]', group);

            const key = myWallet.computeSharedSecret(group.encPri)
            const decode = quickCrypto.De(key, Buffer.from(group.encKey, 'hex'))
            sharedSecret = Buffer.from(decode).toString('utf8')
        } else {
            console.log('[groupb]', group);
            const key = myWallet.computeSharedSecret(myWallet.getPublicKey())
            const decode = quickCrypto.De(key, Buffer.from(group.encKey, 'hex'))
            sharedSecret = Buffer.from(decode).toString('utf8')
            console.log('sharedSecret==', sharedSecret);
        }

        console.log('sharedSecret==', sharedSecret);
        chatItemRef.current = chatItem
        sharedSecretRef.current = sharedSecret

        await loadHistoryMessages(chatItem.id, -1)

        // join room event
        eventUtil.sendSocketJoinEvent(chatItem.id)

        // 註冊 message 接收
        const _eventKey = EventManager.generateKey(IModel.IClient.SocketTypeEnum.MESSAGE, chatItem.id)
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

    }, []);

    const close = useCallback(() => {
        console.log('销毁');
        const _eventKey = EventManager.generateKey(IModel.IClient.SocketTypeEnum.MESSAGE, chatItemRef.current?.id ?? '')
        EventManager.removeListener(_eventKey, handleEvent)
        setMessages([]);
        firstSeq.current = 0;
        lastSeq.current = 0;
    }, []);


    useImperativeHandle(ref, () => ({
        init,
        close,
    }));

    const handleEvent = (e: any) => {
        const { type } = e
        if (type === IModel.IClient.SocketTypeEnum.MESSAGE) {
            const _eventItem = e as SocketMessageEvent
            if (lastSeq.current < _eventItem.sequence && author?.id !== _eventItem.senderId && remoteLastSeq.current < _eventItem.sequence) {
                remoteLastSeq.current = _eventItem.sequence
                if (!remoteMessageLoading.current) {
                    loadRemoteMessages(chatItemRef.current?.id ?? '', lastSeq.current)
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

    /**
     * 发送消息
     * @param key 
     */
    const handleAttachmentPress = async (key: string) => {
        if (!author) return
        switch (key) {
            case 'camera':
                MessageSendService.captureCamera(author).then(addMessage)
                break
            case 'video':
                loadingModalRef.current?.open(t('common.loading'))
                MessageSendService.captureVideo(author).then(addMessage)
                    .finally(() => {
                        loadingModalRef.current?.close()
                    })
                break
            case 'albums':
                MessageSendService.imageSelection(author).then(addMessage)
                break
            case 'file':
                MessageSendService.fileSelection(author).then(addMessage)
                break
            default: break
        }
    }


    const handleMessagePress = async (message: MessageType.Any) => {
        if (message.type === 'file') {
            try {
                fileModalRef.current?.open({
                    encKey: sharedSecretRef.current ?? '',
                    file: message
                })
            } catch { }
        }
        if (message.type === 'video') {
            encVideoPreviewRef.current?.open({
                encKey: sharedSecretRef.current,
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
            senderId: author?.id ?? 0,
            sequence: -1
        }
        addMessage(textMessage)
    }

    /**
   * todo 
   * @param m 长按消息
   */
    const handleLongPress = (m: MessageType.Any, e: GestureResponderEvent) => {
        longPressModalRef.current?.open({
            message: m,
            e
        })
    }

    return (
        <>
            <Chat
                tools={tools}
                messages={messages}
                onEndReached={async () => {
                    loadHistoryMessages(chatItemRef.current?.id ?? '', firstSeq.current)
                }}
                showUserAvatars
                onMessageLongPress={handleLongPress}
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
    )
});
