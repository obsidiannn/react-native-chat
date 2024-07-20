import { Wallet } from "app/utils/wallet"
import authApi from 'app/api/auth/auth';
import { LocalUserService } from "./LocalUserService";
export class AuthService {
    static GetWallet = (): Wallet => {
        if (!global.wallet) {
            throw new Error('wallet not found');
        }
        return global.wallet ;
    }
    static signUp = async () => {
        const user = await authApi.signUp();
        await LocalUserService.add(user);
        return user;
    }
    static getInfo = async () => {
        const user = await authApi.getInfo();
        await LocalUserService.add(user);
        return user;
    }
}