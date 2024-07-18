import { createInstance } from "./req"

export interface IUser {
    id: number;
    userName: string;
    nickName: string;
    gender: number;
}
const signUp = async (): Promise<IUser> => await createInstance(true).post('/auth/signup')
export default {
    signUp
}