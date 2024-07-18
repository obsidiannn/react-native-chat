import { ChatDetailItem } from "@repo/types";
import { IUser } from "@/drizzle/schema";
import { createContext } from "react";

export interface UserChatUIContextType {
    chatItem: ChatDetailItem
    friend: IUser
    setContextTop: (val: number)=>void
}

export const UserChatUIContext = createContext({} as UserChatUIContextType)