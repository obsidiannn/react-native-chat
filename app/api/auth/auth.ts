
import { IUser } from "drizzle/schema";
import { createInstance } from "../req";
import dayjs from "dayjs"
const signUp = async (): Promise<IUser> => {
    const user: any = await createInstance(true).post('/auth/signup')
    user.createdAt = user?.createdAt ? dayjs(user?.createdAt).toDate():null;
    return user as IUser;
}


const destory = async (): Promise<null> => await createInstance(true).post('/auth/destroy')
const getInfo = async (): Promise<IUser> => {
    const rep: {
        user: any
    } = await createInstance(true).post('/auth/info');
    rep.user.createdAt = new Date(rep.user.createdAt);
    return rep.user as IUser;
};

export default {
    signUp,
    destory,
    getInfo
}