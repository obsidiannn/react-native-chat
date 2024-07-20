import generateUtil from "app/utils/generateUtil";
import groupApi from "../api/group/group";

import userService from "./user.service";
import {
    GroupApplyItem, GroupApplyJoinReq, GroupCreateReq, GroupDetailItem, GroupInfoItem, GroupManagerChangeReq,
    GroupMemberItemVO, GroupMemberResp, GroupMembersReq, GroupRequireJoinResp,
    GroupSingleItem, GroupTagReq, GroupTransferReq
} from "@repo/types";
import quickCrypto from "app/utils/quick-crypto";
import { IModel } from "@repo/enums";
import { LocalMessageService } from "./LocalMessageService";

const quit = async (gid: string) => {
    return true;
}
const quitAll = async () => {
    return groupApi.quitAll()
}


// 獲取羣組列表
const getMineList = async () => {
    return groupApi.mineGroupList({});
}


// 用於羣組成員索引表的數據接口
const getMemberList = async (gid: number, requireUids?: number[]): Promise<GroupMemberItemVO[]> => {
    const data = await groupApi.getGroupMembersById({ id: gid, uids: requireUids });
    const { items } = data;
    const uids = items.map(i => i.uid)
    const userHash = await userService.getUserHash(uids)
    const result = items.map(i => {
        const user = userHash.get(i.uid)
        const vo: GroupMemberItemVO = {
            id: i.uid,
            groupId: i.groupId,
            uid: i.uid,
            role: i.role,
            a: i.myAlias ? i.myAlias : user?.nickName ?? '',
            ai: i.aliasIdx ? i.aliasIdx : user?.nickNameIdx ?? '',
            name: user?.nickName ?? '',
            nameIndex: user?.nickNameIdx ?? '',
            pubKey: user?.pubKey ?? '',
            sign: user?.sign ?? '',
            gender: user?.gender ?? 0,
            avatar: user?.avatar ?? '',
            encKey: i.encKey,
            encPri: i.encPri
        }
        return vo
    })
    return result
}

const alphabetList = (items: GroupMemberItemVO[]) => {
    items.sort((a, b) => a.ai.charCodeAt(0) - b.ai.charCodeAt(0));
    const alphabet = [...new Set(items.map(item => item.ai))];
    const alphabetIndex: { [key: string]: number } = {}
    alphabet.forEach((item) => {
        alphabetIndex[item] = items.findIndex((i) => i.ai === item);
    })
    return {
        alphabet,
        alphabetIndex
    };
}

const create = async (name: string, avatar: string, isEnc: boolean, searchType: string) => {
    if (!globalThis.wallet) {
        throw new Error('請先登錄');
    }

    const groupPassword = generateUtil.generateId()
    console.log('[group]create pwd=', groupPassword);

    const myWallet = globalThis.wallet
    const sharedSecret = myWallet?.computeSharedSecret(myWallet.getPublicKey())
    const enc_key = quickCrypto.En(groupPassword, Buffer.from(sharedSecret, 'utf8'));

    const group: GroupCreateReq =
    {
        avatar: avatar,
        name: name,
        isEnc: isEnc ? IModel.ICommon.ICommonBoolEnum.YES : IModel.ICommon.ICommonBoolEnum.NO,
        type: 1,
        banType: 0,
        searchType: Number(searchType),
        encPri: '',
        encKey: Buffer.from(enc_key).toString('hex')
    }
    const { id } = await groupApi.create(group);
    group.id = id
    console.log('group create: ', group);
    return group;
}

/**
 * 創建羣后的邀請加入
 * @param members
 * @param groupInfo
 * @returns
 */
const invite = async (members: {
    id: number,
    pubKey: string
}[], groupInfo: { groupPassword: string, id: number }) => {
    if (!globalThis.wallet) {
        return;
    }
    const myWallet = globalThis.wallet
    // const sharedSecret = wallet?.computeSharedSecret(myWallet.getPublicKey())
    // const groupPassword = quickAes.De(groupInfo.encKey, sharedSecret ?? '');
    console.log('[group]invite pwd=', groupInfo.groupPassword);
    const items: {
        uid: number;
        encPri: string
        encKey: string;
    }[] = [];
    members.forEach(member => {
        const itemSecretKey = wallet?.computeSharedSecret(member.pubKey ?? '')
        const enkey = quickAes.En(groupInfo.groupPassword, itemSecretKey ?? '');
        items.push({
            uid: Number(member.id),
            encPri: myWallet.getPublicKey(),
            encKey: enkey,
        })
    })
    if (items.length > 0) {
        await groupApi.inviteJoin({
            id: groupInfo.id,
            items: items,
        })
    }
    return true;
}
// 申請加入羣組
const apply = async (gid: string) => {
    return true;
}
// 同意加入羣組
const agree = async (id: string) => {

    return true;
}
// 拒絕加入羣組
const refuse = async (id: string) => {
    return true;
}
// 管理員拒絕加入羣組
const adminRefuse = async (id: string) => {

    return true;
}
// 獲取羣組列表
const getList = async () => {
    return groupApi.mineGroupList({});
}
// 獲取羣組成員列表
const getMembers = async (id: string) => {
    const data = await groupApi.getGroupMembers({
        id,
        limit: 100,
        page: 1
    })
    return data.items;
}

const getMemberPage = async (param: GroupMembersReq): Promise<GroupMemberResp> => {
    const data = await groupApi.getGroupMembers(param)
    return data;
}
// 獲取羣組信息
const getInfo = async (id: number): Promise<GroupDetailItem> => {
    const data = await groupApi.groupDegist({
        id: id
    });

    return data;
}


// // Todo: 這裏需要調整
// const encInfo = async (id: string) => {
//     const data = await groupApi.encInfoByIds({
//         ids: [id]
//     });
//     if (data.items.length == 0) {
//         throw new Error('羣組不存在');
//     }
//     return data.items[0];
// }
const join = async (id: number, remark: string): Promise<GroupRequireJoinResp> => {
    return groupApi.requireJoin({ id, encKey: '', encPri: '', remark: remark });
}
const myApplyList = async (ids: string[] = []) => {
    return groupApi.myApplyList({ ids });
}
// 待審覈列表
const applyList = async (ids: number[] = [], reqUserIds?: number[]): Promise<GroupApplyItem[]> => {
    const result = await groupApi.applyList({ ids, uids: reqUserIds });
    const members = result.items ?? []
    const uids = members.map(m => m.uid)
    const userHash = await userService.getUserHash(uids)
    members.forEach(m => {
        const user = userHash.get(m.uid)
        if (user) {
            m.avatar = user?.avatar
            m.name = user.nickName
            m.address = user.userName
            m.pubKey = user.pubKey
        }
    })
    return members
}
// 拒絕加入
const rejectJoin = async (id: number, uids: number[]) => {
    return groupApi.rejectJoin({ id, uids, encKey: '' });
}

// 允許加入羣聊
const adminAgree = async (params: { id: number, uid: number, encPri: string, encKey: string }) => {
    return groupApi.agreeJoin(params);
}

const adminAdd = async (param: GroupManagerChangeReq) => {
    return groupApi.addAdmin(param)
}

const adminRemove = async (param: GroupManagerChangeReq) => {
    return groupApi.removeAdmin(param)
}

const groupSingleInfo = async (ids: number[]) => {
    const result = new Map<number, GroupSingleItem>()
    if (ids.length <= 0) {
        return result
    }
    const groups = await groupApi.groupSingleInfo({ ids: ids })
    if (groups.items.length > 0) {
        groups.items.forEach(g => {
            result.set(g.id, g)
        })
    }
    return result
}

// 剔出羣聊
const kickOut = async (params: {
    id: number;
    uids: number[];
}) => {
    return groupApi.kickOut(params);
}

const saveTag = async (param: GroupTagReq) => {
    return groupApi.saveGroupTag(param)
}
const clearGroupMessages = async (groupIds: number[], chatIds: string[]) => {
    await LocalMessageService.deleteMessageByChatIdIn(chatIds)
    return groupApi.clearGroupMessages({ ids: groupIds })
}

export default {
    quit,
    quitAll,
    create,
    getList,
    getInfo,
    getMembers,
    getMemberList,
    alphabetList,
    join,
    myApplyList,
    applyList,
    invite,
    rejectJoin,

    kickOut,
    getMineList,
    getMemberPage,

    adminAdd,
    adminRemove,
    adminAgree,
    saveTag,
    clearGroupMessages,
    groupSingleInfo
}
