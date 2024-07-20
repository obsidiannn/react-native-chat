import { GetDB } from "app/utils/database";
import { and, inArray, eq, lte, gte, desc, asc } from "drizzle-orm";
import { IUser, users } from "drizzle/schema";
import dayjs from 'dayjs'
export class LocalUserService {
    static async add(data: IUser): Promise<IUser> {
        data = {
            ...data,
            updatedAt: new Date(),
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
    static async findById(id: number): Promise<IUser | undefined> {
        return await GetDB().query.users.findFirst({
            where: eq(users.id, id)
        })
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
        if(!db){
            return []
        }
        // await UserModel.deleteAll()
        const cacheSeconds = 5 * 60
        try{
            const currentSecond = dayjs().unix()
            console.log('cacheSeconds',cacheSeconds);
            
            return (db).select().from(users).where(
                and(
                    inArray(users.id, ids),
                    gte(users.updatedAt, (currentSecond - cacheSeconds) as number)
                ))
                ?? [];
        }catch(e){
            console.error(e);
        }
        return []
    }

    static async findByUserName(username: string): Promise<IUser | undefined> {
        return await GetDB().query.users.findFirst({
            where: eq(users.userName, username)
        })
    }
    static async findByAddr(addr: string): Promise<IUser | undefined> {
        return await GetDB().query.users.findFirst({
            where: eq(users.addr, addr)
        })
    }
}