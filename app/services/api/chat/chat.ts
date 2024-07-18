import { createInstance } from "@/lib/request-instance";
import { BaseIdsArrayReq, BaseArrayResp } from "../types/common";
import {
  ChatListItem, ChatDetailItem, ChatRaiseTopReq,

} from '../types/chat'
// 获取我的会话列表
const mineChatList = async (): Promise<BaseArrayResp<ChatListItem>> => await createInstance(true).post('/chats/mine-list');
const findChatIdByUserId = async (userId: number): Promise<{ id: string }> => await createInstance(true).post('/chats/id-by-user', { userId })

const mineChatDetailList = async (chatId?: string): Promise<BaseArrayResp<ChatDetailItem>> => await createInstance(true).post('/chats/mine-chat', { chatId: chatId })

// 会话详情
const chatDetail = async (param: BaseIdsArrayReq): Promise<BaseArrayResp<ChatDetailItem>> => await createInstance(true).post('/chats/detail', param);

// 删除会话
const deleteChat = async (param: BaseIdsArrayReq) => await createInstance(true).post('/chats/delete', param);

// 置顶
const raiseTop =async (param: ChatRaiseTopReq): Promise<{ isTop: number }> => await createInstance(true).post('/chats/raise-top', param);

const tokenRegister = async (param: { token: string }): Promise<void> => await createInstance(true).post('/chats/tokenRegister', param);

export default {
  mineChatList,
  chatDetail,
  deleteChat,
  raiseTop,
  mineChatDetailList,
  findChatIdByUserId,
  tokenRegister
}