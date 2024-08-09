import { GetDB } from "app/utils/database";
import { and, inArray, eq, desc, asc } from "drizzle-orm";
import { IMessage, messages } from "drizzle/schema";

export interface MessageQueryType {
    chatId: string
    sequence: number
    direction: 'up' | 'down'
    limit: number
}

export class LocalMessageService {
    static async add(data: IMessage) {
        const db = GetDB()
        if (!db) {
            return
        }
        const exist = await db.query.messages.findFirst({
            where: (messages, { eq }) => eq(messages.id, data.id),
        })
        if (exist) {
            return true;
        }
        console.log("新增了一条", data);
        await db.insert(messages).values(data)
        return true;
    }
    /**
      * 批量新增
      * @param _data 
      * @param chatId 
      */
    static async saveBatchEntity(_data: IMessage[]) {
        if (!_data || _data.length <= 0) {
            return
        }
        const db = GetDB()
        if (!db) {
            return
        }
        const exists = await db.query.messages.findMany({
            where: inArray(messages.id, _data.map(d => d.id))
        })
        const inserts = _data.filter(d => !exists.find(e => e.id === d.id))
        console.log('自己发送inserts:', inserts)
        if (inserts.length > 0) {
            await db.insert(messages).values(inserts)
        }
        return true;
    }


    /**
        * 檢索
        * @param param 
        * @returns 
        */
    static async queryEntity(param: MessageQueryType): Promise<IMessage[]> {
        const isUp: boolean = param.direction === 'up';
        console.log('[sqlite] queryEntity', param)
        const data = await (GetDB()).select().from(messages)
            .where(
                and(eq(messages.chatId, param.chatId),
                    // isUp ? lte(messages.sequence, param.sequence) : gte(messages.sequence, param.sequence)
                ))
            .orderBy(isUp ? desc(messages.sequence) : asc(messages.sequence))
            .limit(param.limit)
        console.log("message list data", data);
        return data.sort((a, b) => (b.sequence ?? 1) - (a.sequence ?? 1))

    }

    static async deleteAll(): Promise<void> {
        const db = GetDB()
        if (!db) {
            return
        }
        await db.delete(messages)
    }

    /**
     * 批量刪除消息
     * @param chatIds 
     */
    static async deleteMessageByChatIdIn(chatIds: string[]) {
        const db = GetDB()
        await db.delete(messages).where(inArray(messages.chatId, chatIds))
    }

    /**
     * 批量刪除消息 根據chatId & msgIds
     */
    static async deleteMessageByMsgIds(chatId: string, msgIds: string[]) {
        if (msgIds.length <= 0) {
            return
        }
        const db = GetDB()
        await db.delete(messages).where(
            and(
                inArray(messages.id, msgIds),
                eq(messages.chatId, chatId)
            )
        )
    }


}