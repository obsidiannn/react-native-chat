import { ColorsState } from "app/stores/system"
import { scale } from "app/utils/size"
import { View, Text } from "react-native"
import { useRecoilValue } from "recoil"
export interface HomeTitleProps {
    title: string
}

const HomeTitle = (props: HomeTitleProps) => {

    const themeColor = useRecoilValue(ColorsState)
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
            color: themeColor.title
        }}>
            {props.title}
        </Text>
    </View>
}

export default HomeTitle