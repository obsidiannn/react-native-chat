import { scale, verticalScale } from "app/utils/size";
import { Image } from "expo-image";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

export default (props: {
    onPress?: () => void;
    icon?: string;
    label?: string;
    labelColor?: string;
    rightComponent?: React.ReactNode;
    leftIcon?: React.ReactNode
}) => {
    return <Pressable onPress={() => {
        props.onPress?.();
    }} style={{
        borderRadius: scale(14),
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: scale(10),
        paddingVertical: scale(16)
    }}>
        <View style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: scale(8),
        }}>
            {props.leftIcon}
            <Text style={{
                fontSize: scale(15),
                fontWeight: '400',
                color: (props.labelColor ?? '#000'),
                marginHorizontal: scale(6)
            }}>{props.label}</Text>
        </View>
        {props.rightComponent ?? (props.icon ? <Image source={props.icon} style={{
            width: scale(24),
            height: scale(24),
        }} /> : null)}

    </Pressable>
}