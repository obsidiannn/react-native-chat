import { IChat } from "drizzle/schema";
import dayjs from 'dayjs'
import { GetDB } from "app/utils/database";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { chats } from "drizzle/schema";
import { delaySecond } from "app/utils/delay";
import { IModel } from "@repo/enums";


export class LocalChatService {

    static queryPage() {

    }
    // 不存在过期策略的chat list
    static async findByIdInWithoutTimeout(chatIds: string[]): Promise<IChat[]> {
        if (chatIds.length <= 0)
            return []
        return await GetDB().select().from(chats).where(
            and(
                inArray(chats.id, chatIds),
                gte(chats.refreshAt, delaySecond())
            )
        )
    }
    // 存在过期策略的chat list
    static async findByIdInWithTimeout(chatIds: string[]): Promise<IChat[]> {
        if (chatIds.length <= 0)
            return []
        const db = GetDB()
        return db.select().from(chats).where(
            and(
                inArray(chats.id, chatIds),
                gte(chats.refreshAt, delaySecond())
            )
        )
    }

    static async save(chat: IChat): Promise<IChat> {
        const entity = {
            ...chat,
            refreshAt: dayjs().unix()
        }
        const old = await GetDB().query.chats.findFirst({
            where: eq(chats.id, entity.id)
        })
        if (old) {
            const items = await GetDB().update(chats).set(entity).where(eq(chats.id, entity.id)).returning();
            return items[0];
        }
        const items = await GetDB().insert(chats).values([entity]).returning();
        return items[0];
    }

    static async saveBatch(entities: IChat[]) {
        const db = GetDB()
        if (!db) {
            return
        }
        const now = dayjs().unix()
        await db.transaction(async (tx) => {
            for (let index = 0; index < entities.length; index++) {
                const e = entities[index];
                await tx.insert(chats).values(e).onConflictDoUpdate({ target: chats.id, set: { ...e, refreshAt: now } })
            }
        });

        console.log('[sqlite] chat save batch ', entities.length);

    }

    static async setTop(chatId: string, isTop: number) {
        return await GetDB().update(chats).set({
            isTop
        }).where(eq(chats.id, chatId))
    }

    static async setMute(chatId: string, isMute: number) {
        return await GetDB().update(chats).set({
            isMute
        }).where(eq(chats.id, chatId))
    }



    /**
        * 檢索
        * @param param 
        * @returns 
        */
    static async queryEntity(): Promise<IChat[]> {
        const db = GetDB()
        const data = await db.select().from(chats)
            .orderBy(
                sql`case when ${chats.type} = ${IModel.IChat.IChatTypeEnum.OFFICIAL} then 1 else 0 end desc `
                , desc(chats.isTop))
        return data
    }

}