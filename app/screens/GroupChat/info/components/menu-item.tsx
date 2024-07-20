import { Image } from "@/components/image";
import { Pressable, Text, TouchableOpacity } from "react-native";
import { scale, verticalScale } from "react-native-size-matters/extend";

export default (props: {
    onPress?: () => void;
    icon?: string;
    label?: string;
    labelColor?: string;
    rightComponent?: React.ReactNode;
}) => {
    return <Pressable onPress={() => {
        props.onPress?.();
    }} style={{
        height: verticalScale(50),
        borderRadius: scale(14),
        borderWidth: 1,
        borderColor: '#F4F4F4',
        backgroundColor: '#F8F8F8',
        marginTop: scale(20),
        paddingHorizontal: scale(15),
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }}>
        <Text style={{
            fontSize: scale(15),
            fontWeight: '400',
            color: (props.labelColor ?? '#000'),
        }}>{props.label}</Text>
        {props.rightComponent ?? (props.icon ? <Image source={props.icon} style={{
            width: scale(24),
            height: scale(24),
        }} /> : null)}

    </Pressable>
}