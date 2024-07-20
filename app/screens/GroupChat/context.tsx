import { GroupDetailItem, GroupMemberItemVO } from "@repo/types";
import { createContext } from "react";


export interface GroupChatUiContextType {
	group: GroupDetailItem
	chatId: number
	members?: GroupMemberItemVO[]
    selfMember?: GroupMemberItemVO
	reloadMember: () => Promise<void>
	reloadMemberByUids: (uids: number[]) => Promise<void>
	reloadGroup:()=>Promise<void>
}

export const GroupChatUiContext = createContext({} as GroupChatUiContextType)