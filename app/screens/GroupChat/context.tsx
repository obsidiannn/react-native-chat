import { ChatDetailItem, GroupDetailItem, GroupMemberItemVO } from "@repo/types";
import { createContext } from "react";


export interface GroupChatUiContextType {
	group: GroupDetailItem 
	members: GroupMemberItemVO[]
	selfMember: GroupMemberItemVO 
	chatItem: ChatDetailItem 
	reloadMember: () => Promise<void>
	reloadMemberByUids: (uids: number[]) => Promise<void>
	reloadGroup: () => Promise<void>
	reloadChat: (chat: ChatDetailItem) => void 
}

export const GroupChatUiContext = createContext({} as GroupChatUiContextType)