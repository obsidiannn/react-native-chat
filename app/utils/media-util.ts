import * as ImagePicker from 'expo-image-picker';
// import PhotoEditor from "@baronha/react-native-photo-editor";
import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { requestCameraPermission, requestMicrophonePermission, requestPhotoPermission } from 'app/services/permissions';
export const pickerDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
    });
    if (!result.canceled) {
        return result.assets;
    }
    return [];
}
export const pickerImage = async (): Promise<ImagePicker.ImagePickerAsset[]> => {
    await requestPhotoPermission();
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        exif: false,
        base64: true,
        allowsMultipleSelection: true,
        quality: 1,

    });
    if (!result.canceled) {
        return result.assets;
    }
    return [];
};

export const captureImage = async () => {
    await requestCameraPermission();
    await ImagePicker.requestCameraPermissionsAsync();
    let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        exif: false,
        quality: 1,
    });

    if (!result.canceled) {
        // const s = await PhotoEditor.open({
        //     stickers: [],
        //     path: result.assets[0].uri,
        // })
        // result.assets[0].uri = s.toString()
        return result.assets[0]
    }
}

export const captureVideo = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
    await requestCameraPermission();
    console.log('1');
    // await requestMicrophonePermission();
    
    await ImagePicker.requestCameraPermissionsAsync();
    let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        exif: false,
        quality: 1,
        videoMaxDuration: 15,
    });
    if (!result.canceled) {
        return result.assets[0]
    }
    return null;
};

export const videoFormat = async (asset: ImagePicker.ImagePickerAsset) :Promise<ImagePicker.ImagePickerAsset | null>=> {
    const input = asset.uri
    const output = input.replace(/(.*)(\..*$)/, '$1_output.mp4');
    //    const cmd = `-i ${input} -c:v mpeg4 ${output}`;
    const cmd = `-i ${input} -c:v libx264 ${output}`;
    //    const session = await FFmpegKit.execute(cmd);
    const session = await FFmpegKit.execute(cmd)
    const returnCode = await session.getReturnCode()
    if (ReturnCode.isSuccess(returnCode)) {
        // SUCCESS
        asset.uri = output
        return asset
    } else if (ReturnCode.isCancel(returnCode)) {
        // CANCEL
    } else {
        // ERROR
    }
    return null;
}