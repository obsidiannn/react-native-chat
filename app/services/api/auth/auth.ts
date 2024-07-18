import { createInstance } from "@/lib/request-instance";
import { IServer } from "types/server";
import { UserInfoItem } from "../types/user";
// 注册
const signup = async (): Promise<UserInfoItem> => await createInstance(true).post('/auth/signup')


const destory = async (): Promise<null> => await createInstance(true).post('/auth/destroy')
const getInfo = async (): Promise<{
    user: IServer.IUser
}> => await createInstance(true).post('/auth/info', {});

export default {
    signup,
    destory,
    getInfo
}