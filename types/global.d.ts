import { Wallet } from "app/utils/wallet";

declare global {
    var wallet: Wallet | null;
    var tmpWallet: Wallet | null;
}