import { atom } from "recoil";
export const authUser = atom<{
    id: number;
    userName: string;
} | null>({
    key: "AuthUser",
    default: null
});
export const authWallet = atom<string | null>({
    key: "AuthWallet",
    default: null
});