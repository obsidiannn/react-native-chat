

import { createInstance } from 'app/api/req';
import { BaseArrayResp, IServer } from "@repo/types";

const getRelationList = async (userIds: number[]) => await createInstance(true).post('/friends/getRelationList', { userIds }) as {
  items: {
    userId: number;
    status: boolean;
    chatId: string
  }[]
};
const updateRemark = async (id: number, remark: string): Promise<null> => await createInstance(true).post('/friends/updateRemark', { id, remark });

const getList = async (): Promise<{
  ids: number[]
}> => await createInstance(true).post('/friends/getIdList');
const getBatchInfo = async (ids: number[]): Promise<{
  friends: IServer.IFriend[]
}> => await createInstance(true).post('/friends/getBatchInfo', { ids });

const getFriendIdByUserId = async (ids: number[]): Promise<BaseArrayResp<number>> => await createInstance(true).post('/friends/friendIdByUserId', { ids });

/**
 * 删除自己的全部好友，之后需要清除本地 message data 
 * @returns 
 */
const dropAllFriends = async (): Promise<{ chatIds: string[] }> => await createInstance(true).post('/friends/drop-all');

export default {
  getRelationList,
  updateRemark,
  getList,
  getBatchInfo,
  getFriendIdByUserId,
  dropAllFriends
}