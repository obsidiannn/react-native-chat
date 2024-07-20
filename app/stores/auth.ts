import { Wallet } from "app/utils/wallet";
import { atom } from "recoil";
export const AuthUser = atom<Model.IUser| null>({
    key: "AuthUser",
    default: null
});
export const AuthWallet = atom<Wallet | null>({
    key: "AuthWallet",
    default: null,
});