import { IModel } from "@repo/enums";
import { ChatDetailItem, SocketJoinEvent } from "@repo/types";
import { Wallet } from "app/utils/wallet";
import { IUser } from "drizzle/schema";
import { atom } from "recoil";
import EventManager from 'app/services/event-manager.service'

export const AuthUser = atom<IUser | null>({
    key: "AuthUser",
    default: null
});
export const AuthWallet = atom<Wallet | null>({
    key: "AuthWallet",
    default: null,
});

export const ChatsStore = atom<ChatDetailItem[]>({
    key: "ChatsStore",
    default: [],
    effects_UNSTABLE: [
        ({ onSet }) => {
            onSet((newValue) => {
                const _msg = { type: IModel.IClient.SocketTypeEnum.SOCKET_JOIN, chatIds: newValue.map(c => c.id) } as SocketJoinEvent
                const eventKey = EventManager.generateKey(_msg.type, '')
                EventManager.emit(eventKey, _msg)
            })
        }
    ]

})