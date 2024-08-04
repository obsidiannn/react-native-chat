import chatApi from 'app/api/chat/chat';
import userService from './user.service';
import groupService from './group.service';
import { ChatDetailItem, ChatSequenceItem } from '@repo/types';
import { IModel } from '@repo/enums';
import fileService from './file.service';
import { LocalChatService } from './LocalChatService';
import chatMapper from 'app/utils/chat.mapper';

const queryChatByIdIn = async (chatIds: string[]): Promise<Map<string, ChatDetailItem>> => {
    const chats = await LocalChatService.findByIdInWithTimeout(chatIds)
    const chatsMap = new Map<string, ChatDetailItem>()

    console.log('[sqlite] local chats ', chats);
    if (chats && chats.length > 0) {

        for (let i = 0; i < chats.length; i++) {
            const e = chats[i];
            chatsMap.set(e.id, chatMapper.entity2Dto(e))
        }
    }
    const missedId = chatIds.filter(id => !chatsMap.has(id))
    if (missedId.length > 0) {
        const chatResp = await chatApi.chatByIds(missedId)
        if (chatResp.items && chatResp.items.length > 0) {
            chatResp.items.forEach(e => {
                chatsMap.set(e.id, e)
            })
            void batchSaveLocal(chatResp.items)
        }
    }
    return chatsMap
}

/**
 * 我的消息列表
 */
const mineChatList = async (_chatIds?: string[]): Promise<ChatDetailItem[]> => {
    try {
        const chatIds: string[] = []
        if (!_chatIds) {
            const idResp = await chatApi.mineChatIdList()
            if (!idResp.items || idResp.items.length <= 0) {
                return []
            }
            chatIds.push(...idResp.items)
        } else {
            chatIds.push(..._chatIds)
        }
        const chatsMap = await queryChatByIdIn(chatIds)
        const result: ChatDetailItem[] = []
        const groupIds: number[] = []
        const userIds: number[] = []
        const officialIds: number[] = []

        Array.from(chatsMap.values()).forEach(i => {
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
        const groupHash = await groupService.queryByIdIn(groupIds)
        chatIds.forEach(id => {
            const i = chatsMap.get(id)
            if (i) {
                if (i.type === IModel.IChat.IChatTypeEnum.GROUP && i.sourceId) {
                    const source = groupHash.get(i.sourceId)
                    if (source !== null) {
                        i.avatar = fileService.getFullUrl(source?.avatar ?? '')
                        i.chatAlias = source?.name ?? ''
                    }
                }
                // todo: 這裏要切換成好友備註
                if (i.type === IModel.IChat.IChatTypeEnum.NORMAL && i.sourceId) {
                    const source = userHash.get(i.sourceId)
                    console.log('source', source);

                    if (source !== null) {
                        i.avatar = fileService.getFullUrl(source?.avatar ?? '')
                        i.chatAlias = source?.nickName ?? ''
                        i.describe = source?.sign ?? ''
                    }
                }
                result.push(i)
            }
        })
        return result
    } catch (e) {
        console.error(e)
    }
    return mineLocalChats()
}

/**
 * 刷新或者加载那些可能存在的新的chats
 * @param chats 这里会存在
 * @returns 
 */
const checkAndRefresh = async (chats: ChatDetailItem[]): Promise<{
    news: ChatDetailItem[],
    olds: ChatDetailItem[],
}> => {
    const news: ChatDetailItem[] = []
    const olds: ChatDetailItem[] = []

    try {
        const lastest = await LocalChatService.findLatestId()
        console.log('latest', lastest);

        if (lastest) {
            const idResp = await chatApi.mineChatIdAfter(lastest)
            if (idResp && idResp.items.length > 0) {
                const missedIds = await LocalChatService.findIdNotIn(idResp.items)
                if (missedIds && missedIds.length > 0) {
                    const newsData = await mineChatList(missedIds)
                    news.push(...newsData)
                }
            }
        } else {
            // const newsData = await mineChatList()
            // news.push(...newsData)
            // return { olds, news }
        }
    } catch (e) {
        console.log('[chat]检查chats异常', e);
    }

    if (!chats || chats.length <= 0) {
        return { news, olds }
    }
    const chatIds = chats.map(e => e.id)
    const sequenceResp = await chatApi.queryChatSequence(chatIds)
    if (sequenceResp.items && sequenceResp.items.length > 0) {
        const seqMap = new Map<string, ChatSequenceItem>()
        sequenceResp.items.forEach(i => {
            seqMap.set(i.chatId, i)
        })
        const oldsData = chats.map(c => {
            const seq = seqMap.get(c.id)
            console.log('seq', seq);

            if (seq) {
                c.lastSequence = seq.lastSequence
                c.lastReadSequence = seq.lastReadSequence
                c.firstSequence = seq.firstSequence
                c.lastTime = seq.lastTime
            }
            return c
        })
        olds.push(...oldsData)
    }
    return { news, olds }
}

/**
 * 加载sequence
 * @param chats  
 * @returns 
 */
const refreshSequence = async (chats: ChatDetailItem[]): Promise<ChatDetailItem[]> => {
    if (!chats || chats.length <= 0) {
        return []
    }
    const chatIds = chats.map(e => e.id)
    const sequenceResp = await chatApi.queryChatSequence(chatIds)
    if (sequenceResp.items && sequenceResp.items.length > 0) {
        const seqMap = new Map<string, ChatSequenceItem>()
        sequenceResp.items.forEach(i => {
            seqMap.set(i.chatId, i)
        })
        return chats.map(c => {
            const seq = seqMap.get(c.id)
            console.log('seq', seq);

            if (seq) {
                c.lastSequence = seq.lastSequence
                c.lastReadSequence = seq.lastReadSequence
                c.firstSequence = seq.firstSequence
                c.lastTime = seq.lastTime
            }
            return c
        })
    }
    return chats
}


const mineLocalChats = async (): Promise<ChatDetailItem[]> => {
    const chats = await LocalChatService.queryEntity()
    return chats.map(e => chatMapper.entity2Dto(e))
}

const changeChat = async (dto: ChatDetailItem) => {
    await LocalChatService.save(chatMapper.dto2Entity(dto))
}

const batchSaveLocal = (chats: ChatDetailItem[]) => {
    void LocalChatService.saveBatch(chats.map(c => chatMapper.dto2Entity(c)))
}

export default {
    mineChatList,
    mineLocalChats,
    changeChat,
    batchSaveLocal,
    refreshSequence,
    checkAndRefresh,
}
