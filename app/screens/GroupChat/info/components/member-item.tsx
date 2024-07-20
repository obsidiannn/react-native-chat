import { Image } from "@/components/image";
import { Text, TouchableOpacity } from "react-native";
import { scale } from "react-native-size-matters/extend";

export default (props: {
    avatar: string;
    onPress?: () => void;
    text?: string;
}) => {
    return <TouchableOpacity onPress={props.onPress} style={{
        display: 'flex',
        alignItems: 'center',
        marginRight: scale(10),
        marginTop: scale(10),
    }}>
        <Image source={props.avatar} style={{
            width: scale(50),
            height: scale(50),
            borderRadius: scale(25),
            borderWidth: 1,
            borderColor: '#F0F0F0',
        }} />
        <Text numberOfLines={1} style={{
            fontSize: scale(12),
            fontWeight: '400',
            color: '#666',
            marginTop: scale(7),
        }}>{props.text}</Text>
    </TouchableOpacity>
}