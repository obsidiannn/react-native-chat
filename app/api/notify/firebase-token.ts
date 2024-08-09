import { createInstance } from '../req';
import { Platform } from "react-native";
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as ExpoTrackingTransparency from 'expo-tracking-transparency';
import Crypto from "react-native-quick-crypto";
import { globalKV } from "app/utils/kv-tool";
export interface IRegisterParams {
    token: string;
}
const getDeviceId = async () => {
    const { granted } = await ExpoTrackingTransparency.getTrackingPermissionsAsync();
    let uuid = '';
    if (granted) {
        uuid = ExpoTrackingTransparency.getAdvertisingId() ?? '';
    }
    if (!uuid) {
        uuid = globalKV.get("string", "device_id") as string | undefined ?? '';
        if (!uuid) {
            uuid = Crypto.randomUUID()
            globalKV.set("device_id", uuid)
        }
    }
    return uuid;
}
const register = async (token: string): Promise<boolean> => {
    const params = {
        token,
        platform: Platform.OS,
        osVersion: Device.osVersion,
        appVersion: Application.nativeApplicationVersion,
        deviceId: await getDeviceId()
    }
    return await createInstance(true).post('/notify/firebaseToken/register', params)
}
export default {
    register
}