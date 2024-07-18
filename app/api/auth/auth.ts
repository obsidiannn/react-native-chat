import { createInstance } from "../req";
import { UserInfoItem, IServer } from "@repo/types";
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