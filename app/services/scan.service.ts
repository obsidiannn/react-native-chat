import userApi from "app/api/auth/user";
import userService from "./user.service";
import { navigate } from "app/navigators";


const scanQrcode = async (val: string) => {
    if (val && val !== '') {
        if (val.startsWith('/user/')) {
            const username = val.split('/')[2]
            console.log(username);
            userApi.findByUserName(username).then(res => {
                navigate('UserInfoScreen', {
                    userId: res.id
                })
            })
        }
    }
}

export default {
    scanQrcode
}