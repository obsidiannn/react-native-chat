import friendApplyApi from "app/api/friend/friend-apply";
import { IUser } from "drizzle/schema";
import userService from "./user.service";
import { FriendInviteApplyItem } from "@repo/types";
const create = async (userId: number, remark: string) => {
    console.log('do apply');

    return await friendApplyApi.create(userId, remark);
}
const getList = async () => {
    const result = await friendApplyApi.getList();
    if (result.ids && result.ids.length > 0) {
        console.log(result.ids);
        const data = await friendApplyApi.getBatchInfo(result.ids)
        return data.items
    }
    return []
}
// 同意
const agree = async (id: number) => {
    return await friendApplyApi.agree(id);
}
const reject = async (id: number, reson?: string) => {
    return await friendApplyApi.reject(id, reson);
}
const del = async (id: number) => {
    return await friendApplyApi.del(id);
}

const getApplyListByReqUserId = async (userId: number, selfId: number): Promise<{
    item: FriendInviteApplyItem,
    user: IUser
}[]> => {
    const result = await friendApplyApi.getApplyListByReqUserId(userId)
    if (result.items.length > 0) {
        const uids: number[] = []
        result.items.forEach(i => {
            uids.push(i.uid)
            uids.push(i.friendId)
        })

        const userHash = await userService.getUserHash(uids)
        return result.items.map(ri => {
            const user = userHash.get(ri.friendId === selfId ? ri.uid : ri.friendId)
            console.log('check', user);

            ri.isSelf = ri.friendId === selfId
            if (user) {
                ri.avatar = user.avatar ?? ''
                ri.name = user.nickName ?? ''
            }
            return {
                item: ri as FriendInviteApplyItem, user: user as IUser
            }
        })
    }
    return []
}

export default {
    create,
    getList,
    agree,
    reject,
    del,
    getApplyListByReqUserId
};