import { ChatDetailItem } from "@repo/types";
import { createContext } from "react";

export interface UserChatUIContextType {
    chatItem: ChatDetailItem
    reloadChat: (item: ChatDetailItem) => void
}

export const UserChatUIContext = createContext({} as UserChatUIContextType)