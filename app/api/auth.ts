import { IUser } from "drizzle/schema"
import { createInstance } from "./req"


const signUp = async (): Promise<IUser> => await createInstance(true).post('/auth/signup')
export default {
    signUp
}