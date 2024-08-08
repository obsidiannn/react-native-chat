import { GetDB } from "app/utils/database";
import { and, inArray, eq, lte, gte, desc, asc } from "drizzle-orm";
import { users } from "drizzle/schema";
import type { IUser } from "drizzle/schema";
import dayjs from 'dayjs'

export class LocalUserService {

    static async add(data: IUser): Promise<IUser> {
        data = {
            ...data,
            refreshAt: dayjs().unix()
        }
        console.log("add user", data);
        const old = await GetDB().query.users.findFirst({
            where: eq(users.id, data.id)
        })
        console.log("old user", old);
        if (old) {
            const items = await GetDB().update(users).set(data).where(eq(users.id, data.id)).returning();
            return items[0];
        }
        console.log("新增 user", old);
        const items = await GetDB().insert(users).values([data]).returning();
        return items[0];
    }

    static async deleteByIdIn(ids: number[]) {
        const db = GetDB()
        if (!db) {
            console.log('err');
            return
        }
        const deleteResult = await db.delete(users).where(inArray(users.id, ids)).returning({ deletedId: users.id })
        console.log('delete result', deleteResult);
    }

    static async createMany(data: IUser[]) {
        const db = GetDB()
        if (!db) {
            console.log('err');
            return
        }

        console.log('[sqlite] user saveBatch');
        const now = dayjs().unix()
        await db.transaction(async (tx) => {
            try {
                for (let index = 0; index < data.length; index++) {
                    const e = data[index];
                    await tx.insert(users).values(e).onConflictDoUpdate({ target: users.id, set: { ...e, refreshAt: now } })
                }
            } catch (e) {
                console.error(e)
                tx.rollback()
            }
        }, {
            behavior: "immediate",
        });

        console.log('[sqlite] users save batch ', data.length);
    }

    /**
     * 获取 sqlite 的user 
     * 超时（1h）
     * @param ids 
     * @returns 
     */
    static async findByIds(ids: number[],withTimeout: boolean = true): Promise<IUser[]> {
        if (ids.length <= 0) {
            return []
        }
        const db = GetDB()
        if (!db) {
            return []
        }
        // await UserModel.deleteAll()
        const cacheSeconds = 5 * 60
        try {
            const currentSecond = dayjs().unix()
            console.log('cacheSeconds', cacheSeconds);

            return (db).select().from(users).where(
                and(
                    inArray(users.id, ids),
                    (withTimeout? gte(users.refreshAt, currentSecond - cacheSeconds): undefined)
                ))
                ?? [];
        } catch (e) {
            console.error(e);
        }
        return []
    }

    static async findByUserName(username: string): Promise<IUser | undefined> {
        const cacheSeconds = 5 * 60
        const currentSecond = dayjs().unix()
        return await GetDB().query.users.findFirst({
            where: and(
                eq(users.userName, username),
                gte(users.refreshAt, currentSecond - cacheSeconds)
            )
        })
    }

    static async findByAddr(addr: string): Promise<IUser | undefined> {
        return await GetDB().query.users.findFirst({
            where: eq(users.addr, addr)
        })
    }

    static async setFriends(ids: number[]) {
        if (ids.length <= 0) {
            return;
        }
        const db = GetDB()
        if (!db) {
            return
        }
        return await db.update(users).set({
            isFriend: 1
        }).where(inArray(users.id, ids));
    }
    static async getFriends(): Promise<IUser[]> {
        const db = GetDB()
        if (!db) {
            return []
        }
        return await db.select().from(users).where(eq(users.isFriend, 1));
    }


    static async block(userIds: number[]) {
        if (userIds.length <= 0) {
            return;
        }
        const db = GetDB()
        if (!db) {
            return
        }
        return await db.update(users).set({
            isFriend: 0,
        }).where(inArray(users.id, userIds));
    }

}