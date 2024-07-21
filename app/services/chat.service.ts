import chatApi from 'app/api/chat/chat';
import userService from './user.service';
import groupService from './group.service';
import { ChatDetailItem } from '@repo/types';
import { globalKV } from 'app/utils/kv-tool';
import { IModel } from '@repo/enums';
export const getBatchInfo = async (ids: string) => {
    // 批量獲取信息
}
export const getMineIdList = async () => {
    // 獲取我的會話列表id列表
}
export const getMineList = async () => {
    // 根據獲取ids後
    // 判斷是否命中本地緩存
}
export const findByUserId = async (userId: number) => {
    const cacheKey = `chat:user-id-map:${userId}`;
    const cacheVal = globalKV.get("string", cacheKey);
    let chatId: string | null;
    if (cacheVal) {
        chatId = cacheVal as string
    } else {
        const chats = await mineChatList();
        console.log("chats", chats);
        const chat = chats.find(v => Number(v.chatUserId) == userId)
        console.log("chat", chat, userId);
        if (!chat) {
            return null;
        }
        chatId = chat.id;
    }
    if (!chatId) {
        return null;
    }
    return findById(chatId);
}
const findById = async (chatId: string) => {
    const cacheKey = `chat:detail:${chatId}`;
    const cacheVal = globalKV.getObj<ChatDetailItem>(cacheKey)
    if (cacheVal) {
        return cacheVal;
    }
    const items = await mineChatList(chatId)
    if (!items || items.length <= 0) {
        return null;
    }
    globalKV.set(cacheKey, JSON.stringify(items[0]))
    return items[0];
}
const getChatIdByUserId = async (userId: number): Promise<string> => {
    return (await chatApi.findChatIdByUserId(userId)).id ?? null
}

/**
 * 我的消息列表
 */
const mineChatList = async (chatId?: string): Promise<ChatDetailItem[]> => {
    const list = await chatApi.mineChatDetailList(chatId)
    if (!list.items || list.items.length <= 0) {
        return []
    }
    console.log('itenms', list.items);

    const groupIds: number[] = []
    const userIds: number[] = []
    const officialIds: number[] = []

    list.items.forEach(i => {
        if (i.type === IModel.IChat.IChatTypeEnum.GROUP && i.sourceId) {
            groupIds.push(i.sourceId)
        }
        if (i.type === IModel.IChat.IChatTypeEnum.NORMAL && i.sourceId) {
            userIds.push(i.sourceId)
        }
        if (i.type === IModel.IChat.IChatTypeEnum.OFFICIAL && i.sourceId) {
            officialIds.push(i.sourceId)
        }
    })
    const userHash = await userService.getUserHash(userIds)
    //const officialHash = await userService.officialUserHash(officialIds)
    const groupHash = await groupService.groupSingleInfo(groupIds)

    return list.items.map(i => {
        if (i.type === IModel.IChat.IChatTypeEnum.GROUP && i.sourceId) {
            const source = groupHash.get(i.sourceId)
            if (source !== null) {
                i.avatar = source?.avatar ?? ''
                i.chatAlias = source?.name ?? ''
            }
        }
        // todo: 這裏要切換成好友備註
        if (i.type === IModel.IChat.IChatTypeEnum.NORMAL && i.sourceId) {
            const source = userHash.get(i.sourceId)
            if (source !== null) {
                i.avatar = source?.avatar ?? ''
                i.chatAlias = source?.nickName ?? ''
            }
        }
        if (i.type === IModel.IChat.IChatTypeEnum.OFFICIAL && i.sourceId) {
            // const source = officialHash.get(i.sourceId)
            // if (source !== null) {
            //     i.avatar = source?.avatar ?? ''
            //     i.chatAlias = source?.name ?? ''
            // }
        }
        return { ...i }
    })
    // const chatIds = list.items.map(i=>i.chatId)
    // return (await chatApi.chatDetail({ids: chatIds})).items??[]
}


const chatDetail = async (id: string): Promise<ChatDetailItem[]> => {
    const cacheKey = `chat:detail:${id}`;
    const cacheVal = globalKV.getObj<ChatDetailItem[]>(cacheKey)
    if (cacheVal) {
        return cacheVal;
    }
    const items = (await mineChatList(id)) ?? []
    globalKV.set(cacheKey, JSON.stringify(items))
    return items;
}


export default {
    findById,
    findByUserId,
    mineChatList,
    chatDetail,
    getChatIdByUserId
}
