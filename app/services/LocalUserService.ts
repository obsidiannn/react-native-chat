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
        const old = await GetDB().query.users.findFirst({
            where: eq(users.id, data.id)
        })
        if (old) {
            const items = await GetDB().update(users).set(data).where(eq(users.id, data.id)).returning();
            return items[0];
        }
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
        const ids = data.map(d => d.id)
        const deleteResult = await db.delete(users).where(inArray(users.id, ids)).returning({ deletedId: users.id })
        console.log('delete result', deleteResult);

        await db.insert(users).values(data);
    }

    /**
     * 获取 sqlite 的user 
     * 超时（1h）
     * @param ids 
     * @returns 
     */
    static async findByIds(ids: number[]): Promise<IUser[]> {
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
                    gte(users.refreshAt, currentSecond - cacheSeconds)
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
}