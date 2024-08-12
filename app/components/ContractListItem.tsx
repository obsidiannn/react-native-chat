import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Image } from "expo-image";
import { s } from "app/utils/size";

interface IContactListItemProps {
    icon: string | null;
    title: string | null;
    secondTitle?: string
    badgeNumber?: number | null;
    subTitle?: string | null;
    onPress?: () => void;
    bottomLine?: boolean;
}
export default (props: IContactListItemProps) => {
    return <TouchableOpacity onPress={props.onPress} style={styles.container}>
        <View style={styles.iconContainer}>
            <Image source={props.icon} style={styles.icon} />
            {
                props.badgeNumber && props.badgeNumber > 0 ?
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{props.badgeNumber > 99 ? 99 : props.badgeNumber}</Text>
                    </View> : null
            }
        </View>
        <View style={{
            ...styles.rightContainer,
            borderBottomColor: props.bottomLine ? '#f4f4f4' : 'white',
        }}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{props.title}</Text>
                <Text>{props.secondTitle }</Text>
            </View>
            <View style={styles.subTitleContainer}>
                <Text style={styles.subTitle}>{props.subTitle}</Text>
            </View>
        </View>
    </TouchableOpacity>
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
    },
    iconContainer: {
        width: s(57),
        paddingVertical: s(14),
        display: 'flex',
        justifyContent: 'center',
    },
    icon: {
        width: s(40),
        height: s(40),
        borderRadius: s(20),
        marginRight: s(10),
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    badgeContainer: {
        position: 'absolute',
        top: s(12),
        left: s(32),
        width: s(20),
        height: s(20),
        borderWidth: 1,
        borderColor: '#ffffffcc',
        borderRadius: s(11),
        backgroundColor: '#FF3D00',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    rightContainer: {
        width: s(260),
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    titleContainer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center'
    },
    title: {
        fontWeight: '400',
        fontSize: 16,
        color: '#000000',
    },
    subTitleContainer: {
        width: '40%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    subTitle: {
        color: '#999',
        fontWeight: '400',
        fontSize: 12,
        marginRight: s(6),
    }
});
