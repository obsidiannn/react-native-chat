import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Image } from "expo-image";
import { IServer } from "@repo/types";
import { useTranslation } from 'react-i18next';
import { navigate } from "app/navigators";
import { scale } from "app/utils/size";
import { colors } from "app/theme";
import AvatarComponent from "./Avatar";
import strUtil from "app/utils/str-util";
import toast from "app/utils/toast";

export default (props: {
    item: IServer.IFriend;
    isLast: boolean;
}) => {
    const { item, isLast } = props;
    const {t} = useTranslation('screens')
    return <TouchableOpacity onPress={() => {
        if (!item.relationStatus) {
            navigate('UserInfoScreen', {
                userId: item.id
            })
        } else {
            toast(t('error_already_friend'))
        }
    }} style={{
        ...styles.container,
    }}>
        <AvatarComponent url={props.item.avatar} online={false} /> 
        <View style={{
            ...styles.rightContainer,
            borderBottomColor: isLast ? 'white' : '#F4F4F4',
        }}>
            <View style={{
                display: 'flex',
                flexDirection: 'column',
            }}>
                <Text style={styles.name}>{item.remark}</Text>
                <Text style={{
                    fontSize: 14,
                    color: colors.palette.gray400
                }}>{strUtil.truncateMiddle(item.addr,18)}</Text>
            </View>
            <View>
                <Image style={styles.icon} source={require('assets/icons/arrow-right-gray.svg')} />
            </View>
        </View>
    </TouchableOpacity>
}
const styles = StyleSheet.create({
    container: {
        height: 60,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(25),
        borderWidth: 1,
        borderColor: '#F0F0F0',
        marginRight: scale(15),
    },
    rightContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        borderBottomWidth: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    name: {
        fontSize: scale(16),
        fontWeight: '400',
        color: '#000',
    },
    icon: {
        width: scale(20),
        height: scale(20),
    }
});