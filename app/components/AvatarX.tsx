import fileService from "app/services/file.service";
import { colors } from "app/theme"
import { s, scale } from "app/utils/size"
import { Image, ImageStyle } from "expo-image"
import { View, ViewStyle } from "react-native"

export interface AvatarXProps {
    uri: string;
    online?: boolean;
    border?: boolean;
    size?: number;
}

const AvatarX = (props: AvatarXProps) => {
    const { border = false, size = 48, online = false, uri } = props;
    return <View style={$container} >
        <View style={[
            (border ? $border : null),
            {
                width: s(size),
                height: s(size)
            }, {
                borderRadius: s(size / 2),
                overflow: 'hidden'
            }
        ]}>
            <Image source={fileService.getFullUrl(uri)} style={[$avatar, { width: s(size), height: s(size) }]} />
        </View>
        {
            online ?
                <View style={[
                    $badge,
                    { backgroundColor: '#00D32D' }
                ]}>
                </View> : null
        }
    </View>

}
const $container: ViewStyle = {
    flexDirection: 'row',
    display: 'flex'
}
const $border: ViewStyle = {
    borderWidth: scale(3),
    borderStartColor: 'red',
    borderEndColor: '#890084',
    borderTopColor: '#8A0184',
    borderBottomColor: 'green',
}
const $avatar: ImageStyle = {
    display: 'flex',
    justifyContent: 'center',
};
const $badge: ViewStyle = {
    position: 'relative',
    bottom: 0,
    right: 15,
    alignSelf: 'flex-end',
    padding: scale(6),
    borderColor: '#ffffff',
    borderWidth: scale(2),
    borderRadius: scale(12),
    backgroundColor: colors.palette.gray400,
};

export default AvatarX