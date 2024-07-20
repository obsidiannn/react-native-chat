import { IUser } from "drizzle/schema";
import { createInstance } from "../req";

const signUp = async (): Promise<IUser> => {
    const user: any = await createInstance(true).post('/auth/signup')
    user.createdAt = new Date(user.createdAt);
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