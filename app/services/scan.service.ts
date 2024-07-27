import { Linking } from "react-native";


const scanQrcode = async (val: string) => {
    if(await Linking.canOpenURL(val)){
        Linking.openURL(val)
    }
}

export default {
    scanQrcode
}