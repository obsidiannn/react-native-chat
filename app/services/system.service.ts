import { globalStorage } from "app/utils/kv-tool"

export class SystemService{
    static GetApiUrlByCache = () => {
        const apiUrl = globalStorage.get('string','NOW_API_URL')
        if(apiUrl){
            return apiUrl as string;
        }
        return process.env.EXPO_PUBLIC_SYSTEM_API_URL;
    }
    static GetApiUrl = () => {

    }
}