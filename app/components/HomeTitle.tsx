import { colors } from "app/theme"
import { scale } from "app/utils/size"
import { Image } from "expo-image"
import { View, Text, Pressable } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"

export interface HomeTitleProps {
    title: string
    dark?: boolean
}

const HomeTitle = (props: HomeTitleProps) => {

    return <View style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: scale(24)
    }}>
        <Text style={{
            fontWeight: 600,
            fontSize: scale(32),
            color: props.dark ? '#ffffff' : 'black'
        }}>
            {props.title}
        </Text>
        <TouchableOpacity accessibilityRole="button" style={{
            padding: scale(10),
            backgroundColor: props.dark ? '#294AF5' : colors.palette.gray600,
            borderRadius: scale(24)
        }}>
            <Image source={require('assets/icons/plus.svg')} style={{
                width: scale(24),
                height: scale(24)
            }} />
        </TouchableOpacity>
    </View>
}

export default HomeTitle