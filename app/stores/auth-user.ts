import { globalStorage } from "app/utils/kv-tool";
import { Wallet } from "app/utils/wallet";
import { atom, selector } from "recoil";
export const AuthUser = atom<{
    id: number;
    userName: string;
} | null>({
    key: "AuthUser",
    default: null
});
export const AuthWallet = atom<Wallet | null>({
    key: "AuthWallet",
    default: selector({
        key: 'AuthWallet/default',
        get: () => {
            const priKey = globalStorage.get("string", "NOW_PRI_KEY")
            if (priKey) {
                return new Wallet(priKey as string);
            }
            return null;
        },
    }),
    effects_UNSTABLE: [
        ({ onSet }) => {
            onSet((newValue) => {
                if (newValue) {
                    globalStorage.set("NOW_PRI_KEY", newValue.priKey());
                }
            })
        },
    ]
});