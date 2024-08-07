import React, { forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import tools from './tools';
import {
    GroupMemberItemVO,
    ChatDetailItem, DeleteMessageEvent, SocketJoinEvent,
    SocketMessageEvent
} from "@repo/types";
import EventManager from 'app/services/event-manager.service'
import { useTranslation } from 'react-i18next';
import { Chat, MessageType, darkTheme, lightTheme } from "app/components/chat-ui";
import { MediaTypeOptions, launchImageLibraryAsync } from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker';
import chatUiAdapter from "app/utils/chat-ui.adapter";
import { useRecoilValue } from "recoil";
import messageSendService from "app/services/message-send.service";
import { PreviewData } from "@flyerhq/react-native-link-preview";

import VideoPlayModal, { IVideoPreviewModal } from "app/components/VideoModal"
import FilePreviewModal, { ChatUIFileModalRef } from "app/components/FileModal"

import { captureImage, captureVideo, videoFormat, generateVideoThumbnail } from 'app/utils/media-util';
import LongPressModal, { LongPressModalType } from "app/components/LongPressModal";
import LoadingModal, { LoadingModalType } from 'app/components/loading-modal';

import { IModel } from "@repo/enums";
import { AuthUser } from "app/stores/auth";
import quickCrypto from "app/utils/quick-crypto";
import generateUtil from "app/utils/generateUtil";
import { GestureResponderEvent } from "react-native";
import { ThemeState } from "app/stores/system";
import chatService from "app/services/chat.service";


export interface GroupChatPageRef {
    init: (
        chatItem: ChatDetailItem,
        author: GroupMemberItemVO,
    ) => void;
    close: () => void;
}
export default forwardRef((props, ref) => {
    const [messages, setMessages] = useState<MessageType.Any[]>([])
    const theme = useRecoilValue(ThemeState)
    const chatItemRef = useRef<ChatDetailItem>()
    const authorRef = useRef<GroupMemberItemVO>()
    const author = useRecoilValue(AuthUser)
    const sharedSecretRef = useRef<string>('');
    const firstSeq = useRef<number>(0);
    const lastSeq = useRef<number>(0);
    const encVideoPreviewRef = useRef<IVideoPreviewModal>();
    const longPressModalRef = useRef<LongPressModalType>();
    const loadingModalRef = useRef<LoadingModalType>(null)
    const { t } = useTranslation('screen-group-chat')
    const fileModalRef = useRef<ChatUIFileModalRef>()


    const addMessage = (message: MessageType.Any) => {
        const { sequence = 0 } = message
        if (sequence > lastSeq.current) {
            lastSeq.current = sequence
        }
        console.log('------add message', sequence);
        setMessages([message, ...messages])
    }

    const updateMessage = (message: MessageType.Any) => {
        console.log('update', message);
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
    }

    const init = useCallback((
        chatItem: ChatDetailItem,
        author: GroupMemberItemVO,
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

        authorRef.current = author
        chatItemRef.current = chatItem

        if (sharedSecretRef.current) {
            return
        }
        let sharedSecret: string
        if (author?.encPri !== '' && author?.encPri !== null && author?.encPri !== undefined) {
            console.log('[groupa]', author);

            const key = myWallet.computeSharedSecret(author.encPri)
            const decode = quickCrypto.De(key, Buffer.from(author.encKey, 'hex'))
            sharedSecret = Buffer.from(decode).toString('utf8')
        } else {
            console.log('[groupb]', author);
            const key = myWallet.computeSharedSecret(myWallet.getPublicKey())
            const decode = quickCrypto.De(key, Buffer.from(author.encKey, 'hex'))
            sharedSecret = Buffer.from(decode).toString('utf8')
            console.log('sharedSecret==', sharedSecret);
        }
        console.log('sharedSecret==', sharedSecret);
        sharedSecretRef.current = sharedSecret
        // join room
        const _msg = { type: IModel.IClient.SocketTypeEnum.SOCKET_JOIN, chatIds: [chatItem.id] } as SocketJoinEvent
        const eventKey = EventManager.generateKey(_msg.type, '')
        EventManager.emit(eventKey, _msg)

        // 註冊 message 接收
        const _eventKey = EventManager.generateKey(IModel.IClient.SocketTypeEnum.MESSAGE, chatItem.id)
        EventManager.addEventSingleListener(_eventKey, handleEvent)

        messageLoad(chatItem)

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


    const messageLoad = async (_chatItem: ChatDetailItem) => {
        firstSeq.current = _chatItem.lastSequence
        lastSeq.current = _chatItem.lastSequence
        console.log('[groupchat]load local');
        await loadMessages('up', true);
        try {
            console.log('刷新chat');
            const oldSeq = _chatItem.lastSequence
            const newChatItem = await chatService.refreshSequence([_chatItem])
            _chatItem = newChatItem[0]
            // 有未讀
            const limit = _chatItem.lastSequence - oldSeq
            if (limit > 0) {
                console.log('[groupchat]load remote');
                loadMessages('down', false, limit);
            }
        } catch (e) {
            console.error(e)
        }
    }


    const handleEvent = (e: any) => {
        const { type } = e
        console.log('[event]', e);
        console.log('checkauthor', author?.id)
        if (type === IModel.IClient.SocketTypeEnum.MESSAGE) {
            const _eventItem = e as SocketMessageEvent
            if (lastSeq.current < _eventItem.sequence && author?.id !== _eventItem.senderId) {
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
        const chatItem = chatItemRef.current
        if (!chatItem || chatItem === null) {
            return
        }

        let seq = direction == 'up' ? firstSeq.current : lastSeq.current;
        if (!init) {
            if (direction === 'up') {
                seq -= 1
                if (seq <= (chatItem.firstSequence)) {
                    return
                }
            } else {
                seq += 1
            }
        } else {
            if (seq <= 1) {
                seq = 10
            }
        }
        console.log('load group', direction, seq);


        return messageSendService.getList(
            chatItem.id,
            sharedSecretRef.current,
            seq,
            direction,
            chatItem.firstSequence,
            true, limit
        )
            .then((res) => {
                if (res.length <= 0) {
                    return
                }

                const maxSeq = res[0].sequence ?? 0
                const minSeq = res[res.length - 1].sequence ?? 0
                let _data: any[] = []
                if (direction === 'up') {
                    if (!init && firstSeq.current <= minSeq) {
                        return
                    } else {
                        _data = res.filter(r => {
                            if (init) {
                                return true
                            }
                            return (r.sequence ?? 0) < firstSeq.current
                        })
                        firstSeq.current = minSeq
                        if (_data.length > 0) {
                            setMessages((items) => {
                                return items.concat(_data)
                            });
                        }
                    }
                }

                if (direction === 'down') {
                    if (lastSeq.current >= maxSeq) {
                        return
                    } else {
                        _data = res.filter(r => {
                            if (init) {
                                return true
                            }
                            return (r.sequence ?? 0) > lastSeq.current
                        })
                        lastSeq.current = maxSeq
                        if (_data.length > 0) {
                            setMessages((items) => {
                                return _data.concat(items);
                            });

                        }
                    }
                }

            }).catch((err) => {
                console.log('err', err);
            }).finally(() => {
            })
    }, [])

    /**
     * 发送消息
     * @param key 
     */
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
                // uri: `data:image/*;base64,${response.base64}`,
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
            loadingModalRef.current?.open(t('label_pending'))
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
        messageSendService.send(chatItemRef.current?.id ?? '', sharedSecretRef.current, textMessage)
            .then(res => {
                console.log('message', res);
                updateMessage(res)
            })
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

        // deleteFunc: async () => {
        //     const chatId = chatItemRef.current?.id ?? ''
        //     await messageSendService.deleteMessage(chatId, [m.id])
        //     const event: DeleteMessageEvent = { msgIds: [m.id], type: IModel.IClient.SocketTypeEnum.DELETE_MESSAGE }
        //     const eventKey = EventManager.generateChatTopic(chatId)
        //     EventManager.emit(eventKey, event)
        // }
    }

    return (
        <>
            <Chat
                tools={tools}
                messages={messages}
                onEndReached={async () => {
                    loadMessages('up')
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
