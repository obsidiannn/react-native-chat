import { GetDB } from "app/utils/database";
import { and, inArray, eq, lte, gte, desc, asc, sql } from "drizzle-orm";
import { IMessage, messages } from "drizzle/schema";

export interface MessageQueryType {
    chatId: string
    sequence: number
    direction: 'up' | 'down'
    limit: number
}

export class LocalMessageService {
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
        console.log('[sqlite] messages saveBatch');
        await db.transaction(async (tx) => {
            try {
                for (let index = 0; index < _data.length; index++) {
                    const e = _data[index];
                    await tx.insert(messages).values(e).onConflictDoUpdate({ target: messages.id, set: { ...e, } })
                }
                tx.run(sql`commit`)
            } catch (e) {
                tx.rollback()
                console.error(e)
            }
        });
        console.log('[sqlite] groups messages batch ', _data.length);
    }


    /**
        * 檢索
        * @param param 
        * @returns 
        */
    static async queryEntity(param: MessageQueryType): Promise<IMessage[]> {
        const isUp: boolean = param.direction === 'up';

        const data = await (GetDB()).select().from(messages)
            .where(
                and(eq(messages.chatId, param.chatId),
                    isUp ? lte(messages.sequence, param.sequence) : gte(messages.sequence, param.sequence)
                ))
            .orderBy(isUp ? desc(messages.sequence) : asc(messages.sequence))
            .limit(param.limit)

        return data.sort((a, b) => {
            return (b.sequence ?? 1) - (a.sequence ?? 1)
        })

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