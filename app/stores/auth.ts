import { Wallet } from "app/utils/wallet";
import { IUser } from "drizzle/schema";
import { atom } from "recoil";
export const AuthUser = atom<IUser| null>({
    key: "AuthUser",
    default: null
});
export const AuthWallet = atom<Wallet | null>({
    key: "AuthWallet",
    default: null,
});