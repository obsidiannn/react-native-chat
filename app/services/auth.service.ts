import { globalStorage } from "app/utils/kv-tool"
import { Wallet, generatePrivateKey } from "app/utils/wallet"

export class AuthService {
    static GetWallet = (): Wallet => {
        return global.wallet ?? AuthService.GetTmpWallet();
    }
    static GetTmpWallet = (): Wallet => {
        if (!global.tmpWallet) {
            let priKey = globalStorage.get('string', 'TMP_PRI_KEY')
            if (!priKey) {
                priKey = generatePrivateKey();
                globalStorage.set('TMP_PRI_KEY', priKey as string);
            }
            global.tmpWallet = new Wallet(priKey as string);
        }
        return global.tmpWallet;
    }
}