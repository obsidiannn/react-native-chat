import { GetDB } from "app/utils/database"
import { pageSkip } from "app/utils/query";
import dayjs from "dayjs";
import { and, desc, eq, asc, inArray, like, lt, sql } from "drizzle-orm";
import { ICollect, collects } from "drizzle/schema"

export interface ICollectQueryPage {
    type?: string,
    desc?: boolean
    keyword: string | null
    page: number
    size: number
}

export class LocalCollectService {

    static async addBatch(entities: ICollect[]) {
        const db = GetDB()
        const msgIds: string[] = entities.map(item => item.msgId ?? '');
        const olds = await db.query.collects.findMany({
            where: (collects, { inArray }) => inArray(collects.msgId, msgIds),
            columns: {
                id: true,
                msgId: true
            }
        })
        const inserts = entities.filter(item => !olds.find(old => old.msgId === item.msgId))
        if (inserts.length > 0) {
            await db.insert(collects).values(inserts.map(item => {
                return {
                    ...item,
                    createdAt: dayjs().unix()
                }
            }))
        }
        return entities;
    }


    /**
     * 分页查询
     * @param param 
     * @returns 
     */
    static async queryPage(param: ICollectQueryPage): Promise<ICollect[]> {
        const db = GetDB()
        const offset = pageSkip(param.page, param.size)
        const data = await db.query.collects.findMany({
            where: (and(
                (param.type ? eq(collects.type, param.type) : undefined),
                (param.keyword ? like(collects.title, '%' + param.keyword + '%') : undefined),
            )),
            orderBy: (
                (param.desc ? desc(collects.id) : asc(collects.id))
            ),
            offset,
            limit: param.size
        })
        return data
    }

}