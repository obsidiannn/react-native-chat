import { createInstance } from "./req"


const signUp = async (): Promise<Model.IUser> => await createInstance(true).post('/auth/signup')
export default {
    signUp
}