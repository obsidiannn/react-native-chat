import { GetDB } from "app/utils/database";
import { eq } from "drizzle-orm";
import { users } from "drizzle/schema";

export class LocalUserService {
    static async add(data: Model.IUser): Promise<Model.IUser> {
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
    static async findById(id: number): Promise<Model.IUser | undefined> {
        return await GetDB().query.users.findFirst({
            where: eq(users.id, id)
        })
    }
    static async findByUserName(username: string): Promise<Model.IUser | undefined> {
        return await GetDB().query.users.findFirst({
            where: eq(users.userName, username)
        })
    }
    static async findByAddr(addr: string): Promise<Model.IUser | undefined> {
        return await GetDB().query.users.findFirst({
            where: eq(users.addr, addr)
        })
    }
}