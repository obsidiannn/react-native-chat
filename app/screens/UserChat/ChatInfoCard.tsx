import { colors } from "app/theme";
import { scale } from "app/utils/size";
import { Image } from "expo-image";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";


export default (props: {
    avatar: string;
    name: string;
}) => {
    return <View style={styles.container}>
        <View style={styles.avatarContainer}>
            <Image source={props.avatar} style={styles.avatar} />
            <Text numberOfLines={1} style={styles.name}>{props.name}</Text>
        </View>
        <TouchableOpacity>
            <Image source={require('assets/icons/circle-plus-big-white.svg')} style={styles.icon} />
        </TouchableOpacity>
    </View>
};
const styles = StyleSheet.create({
    container: {
        borderRadius: scale(16),
        borderWidth: 1,
        borderColor: '#F4F4F4',
        backgroundColor: '#F8F8F8',
        padding: scale(15),
        display: 'flex',
        flexDirection: 'row',
    },
    avatarContainer: {
        width: scale(50),
        marginRight: scale(20),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatar: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(25),
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    name: {
        textAlign: 'center',
        marginTop: scale(4),
        color: colors.palette.gray600,
        fontSize: scale(12)
    },
    icon: {
        width: scale(50),
        height: scale(50),
    },
});