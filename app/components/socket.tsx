import socketClient, { Socket } from 'socket.io-client'
import React, { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppStateStatus, Platform } from 'react-native';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import EventManager from 'app/services/event-manager.service'

import quickCrypto from 'app/utils/quick-crypto';
import { AuthUser, AuthWallet, ChatsStore } from 'app/stores/auth';
import { ChatDetailItem, SocketJoinEvent, SocketMessageEvent } from '@repo/types';
import { IModel } from '@repo/enums';

export interface SocketContextType {
    socket: Socket
    initRoom: (items: ChatDetailItem[]) => void
    init: () => void;
    close: () => void;
    setAppState: (state: AppStateStatus) => void;
}

export const SocketContext = createContext({} as SocketContextType)

const connectionConfig = {
    timeout: 10000,
    pingTimeout: 30000,
    jsonp: false,
    reconnection: false,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10000,
    transport: ['websocket'],
    query: {
        platform: Platform.OS
    }
}

export const SocketProvider = ({ children }: { children: any }) => {
    const socketRef = useRef<Socket>()
    const wallet = useRecoilValue(AuthWallet)
    const currentUser = useRecoilValue(AuthUser)
    const connectedRef = useRef<boolean>(false)
    const [connected, setConnected] = useState<boolean>(false)
    const appStateRef = useRef<AppStateStatus>("active")
    const setChatList = useSetRecoilState(ChatsStore)
    const joinedRef = useRef<Set<string>>(new Set())
    useEffect(() => {
        const _eventKey = EventManager.generateKey(IModel.IClient.SocketTypeEnum.SOCKET_JOIN, '')
        EventManager.addEventSingleListener(_eventKey, handleJoin)
    }, [])

    const handleJoin = (e: any) => {
        console.log('socket join event', e);
        console.log('socket join', joinedRef.current);
        const _event = e as SocketJoinEvent
        if (!socketRef.current) {
            return
        }
        if (_event.chatIds && _event.chatIds.length > 0) {
            const chatIds = _event.chatIds.filter(c => {
                return !joinedRef.current.has(c)
            })
            const result = initRoom(chatIds)
            console.log('join', result);
            if (result.length > 0) {
                result.forEach(r => {
                    joinedRef.current.add(r)
                })
            }
        }

    }
    const setAppState = (state: AppStateStatus) => appStateRef.current = state

    const reJoin = () => {
        console.log('rejoin:', joinedRef.current);

        if (joinedRef.current && joinedRef.current.size > 0) {
            initRoom(Array.from(joinedRef.current))
        }
    }

    const loadSocketConfig = () => {
        if (!wallet) {
            return null
        }
        const content = JSON.stringify({ id: currentUser?.id })
        const time = String(Math.floor(new Date().getTime() / 1000))
        // const sharedSecret = wallet.signingKey.computeSharedSecret(Buffer.from(sysPubKey, 'hex'))
        const dataHash = quickCrypto.En(content, Buffer.from(process.env.EXPO_PUBLIC_SYSTEM_PUBLIC_KEY, 'utf8'))
        const sign = wallet.signMessage(dataHash + ':' + time)
        const config = {
            ...connectionConfig,
            extraHeaders: {
                'X-Sequence': currentUser?.id,
                'X-Pub-Key': wallet.getPublicKey(),
                'X-Sign': sign,
                'X-Time': time,
                'X-Data-Hash': dataHash
            }
        }
        return config
    }

    const init = () => {
        console.log('初始化[socket] close');
        // const env = getSocketUrl()
        const env = 'http://localhost:9500'
        const config = loadSocketConfig()
        if (config === null) {
            return
        }
        let newClient = false
        if (socketRef.current === null || socketRef.current === undefined) {
            socketRef.current = socketClient(env, { ...config, path: '/ws' })
            newClient = true
        } else {
            if (!socketRef.current?.active) {
                socketRef.current?.connect()
            }
        }
        console.log('[socket] init:', env, config);
        initListener()
    }
    const close = () => {
        console.log('主动[socket] close');
        socketRef.current?.close()
    }
    const initListener = () => {
        if (!socketRef.current) {
            return
        }
        console.log('init listener');
        socketRef.current.on('connect', () => {
            connectedRef.current = true;
            console.log('[socket] conencted');
            setConnected(true)
            reJoin()
        })
        socketRef.current.on('message', (msg) => {
            const _msg = JSON.parse(msg) as SocketMessageEvent
            console.log('[socket] receive', _msg)
            const eventKey = EventManager.generateKey(_msg.type, _msg.chatId)
            try {
                EventManager.emit(eventKey, _msg)
            } catch (e) {
                console.log(e);
            }
            setChatList((items) => {
                const newItems = items.map(t => {
                    if (_msg.chatId === t.id) {
                        return { ...t, lastSequence: _msg.sequence }
                    }
                    return t
                })
                return newItems
            })
        })
        socketRef.current.on('disconnect', msg => {
            console.log('[socket] disconnect');
            connectedRef.current = false;
            joinedRef.current?.clear()
            socketRef.current?.removeAllListeners()
            setConnected(false)
            if (appStateRef.current == "active") {
                setTimeout(() => {
                    init()
                }, 3000);
            }
        })
        socketRef.current.connect()

    }

    const initRoom = (chatIds: string[]): string[] => {
        const result: string[] = []
        if (chatIds.length > 0 && socketRef.current) {
            chatIds.forEach(c => {
                console.log('加入room', c, socketRef.current !== null);
                socketRef.current?.emit('join', c)
                result.push(c)
            })
        }
        return result
    }

    return <SocketContext.Provider value={{ socket: socketRef.current, init, setAppState, close }} >
        {children}
    </SocketContext.Provider>
}
