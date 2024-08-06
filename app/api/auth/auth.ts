
import { IUser } from "drizzle/schema";
import { createInstance } from "../req";
import dayjs from "dayjs";
const signUp = async (): Promise<IUser> => {
    const rep: {
        user: any
    } = await createInstance(true).post('/auth/signup')
    rep.user.createdAt = dayjs(rep.user.createdAt).toDate();
    return rep.user as IUser;
}


const destory = async (): Promise<null> => await createInstance(true).post('/auth/destroy')
const getInfo = async (): Promise<IUser> => {
    const rep: {
        user: any
    } = await createInstance(true).post('/auth/info');
    rep.user.createdAt = dayjs(rep.user.createdAt).toDate();
    return rep.user as IUser;
};

export default {
    signUp,
    destory,
    getInfo
}