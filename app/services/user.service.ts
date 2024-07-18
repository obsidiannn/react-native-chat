import userApi from "app/api/auth/user";
// import { IUser } from '@/drizzle/schema';
// import UserModel from '@/service/user.model';
import { diff } from "radash"
import dayjs from "dayjs"
import { OfficialUserItem } from "@repo/types";


const findByUserName = async (username: string) => {
    const result = await userApi.findByUserName(username);
    if (result.id !== null) {
        console.log('goon');

        return await findById(result.id);
    }
    return null;
}

const findByIds = async (ids: number[]): Promise<IUser[]> => {
    return []
    // ids = [...new Set(ids)]
    // const localUsers = await UserModel.findByIds(ids);

    // const missingIds = diff(ids, localUsers.map(i => i.id));

    // if (missingIds.length > 0) {
    //     const result = await userApi.getBatchInfo(missingIds);
    //     const users = result.users.map(u => {
    //         return {
    //             ...u,
    //             refreshAt: dayjs().unix(),
    //         } as IUser
    //     })
    //     await UserModel.createMany(users)
    //     return [...localUsers, ...users]
    // }
    // return localUsers as IUser[];
}
const findById = async (id: number) => {
    const users = await findByIds([id]);
    if (users.length > 0) {
        return users[0];
    }
    return null;
}

const getUserHash = async (ids: number[]): Promise<Map<number, IUser>> => {
    // const result = new Map<number, IUser>()
    // if (ids.length <= 0) {
    //     return result
    // }
    // const users = await findByIds(ids)
    // users.forEach(u => {
    //     result.set(u.id, u)
    // })
    return new Map()
}

const officialUserHash = async (ids: number[]): Promise<Map<number, OfficialUserItem>> => {
    const result = new Map<number, OfficialUserItem>()
    if (ids.length <= 0) {
        return result
    }
    const users = await userApi.findOfficialUsers({ ids: ids });
    users.items.forEach(u => {
        result.set(u.id, u)
    })
    return result
}

const setNonFriends = async (ids: number[]) => {
    // return await UserModel.setNonFriends(ids);
}
const setFriends = async (ids: number[]) => {
    // return await UserModel.setFriends(ids);
}

export default {
    findById,
    findByIds,
    findByUserName,
    getUserHash,
    officialUserHash,
    setNonFriends,
    setFriends
}