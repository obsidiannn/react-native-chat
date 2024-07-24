import friendApi from "app/api/friend/friend";
import userService from "./user.service";
import { map, select } from "radash";
import { IUser } from "drizzle/schema";
import { LocalUserService } from "./LocalUserService";

const getReleationList = async (userIds: number[]) => {
    return await friendApi.getRelationList(userIds);
}


/**
 * 根據userId獲取friendInfo
 * @param userId 
 */
const getFriendInfoByUserId = async (userId: number): Promise<IUser | null> => {
    const user = await userService.findById(userId)
    if (user === null) {
        return null
    }
    if (user.friendId === null) {
        const friendResp = await friendApi.getFriendIdByUserId([userId])
        if (friendResp.items.length > 0) {
            const { friends } = await friendApi.getBatchInfo(friendResp.items);
            const friend = friends[0]
            user.friendId = friend.id
            user.remark = friend.remark
            user.remarkIdx = friend.remarkIdx
            user.chatId = friend.chatId
        }
        // todo: await LocalUserService.update(user)
    }
    return user
}



/**
 * 根據friendId 獲取friend
 * @param ids friendId
 * @returns 
 */
const findByIds = async (ids: number[]) => {
    const infoRep = await friendApi.getBatchInfo(ids);
    const { friends } = infoRep;
    return friends;
}
const getIds = async () => {
    const rep = await friendApi.getList();
    return rep.ids;
}
const getOfflineList = async () => {
    const users = await LocalUserService.getFriends();
    return users;
}
const getOnlineList = async () => {
    const friendIds = await getIds();
    console.log('friendIds', friendIds);

    if (friendIds.length === 0) {
        return [];
    }
    const friends = await findByIds(friendIds);
    const userIds = select(friends, f => f.friendId, () => true)
    const users = await userService.findByIds(userIds);
    console.log("users==:", users);
    const items = await map(users, async u => {
        const friend = friends.find(f => f.friendId === u.id);
        if (!friend) {
            return null;
        }
        return {
            ...u,
            friendId: friend.id,
            remark: friend.remark,
            chatId: friend.chatId,
            remarkIdx: friend.remarkIdx,
            isFriend: 1,
        };
    })
    await userService.setNonFriends(userIds);
    await LocalUserService.setFriends(userIds);
    return items.filter(i => i != null) as IUser[];
}
const removeAll = async () => {
    return true;
}
const removeBatch = async (uids: string[]) => {
    return true;
}
const remove = async (uid: string) => {
    return removeBatch([uid]);
}
const updateRemark = async (id: number, remark: string): Promise<void> => {
    return await friendApi.updateRemark(id, remark);
}
export default {
    getOnlineList,
    removeAll,
    removeBatch,
    remove,
    updateRemark,
    getReleationList,
    getOfflineList,
    getFriendInfoByUserId
};