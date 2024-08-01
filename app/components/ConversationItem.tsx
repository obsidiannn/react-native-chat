import { s } from "app/utils/size";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import AvatarComponent from "./Avatar";


export interface IContactListItemProps {
    icon: string | null;
    title: string | null;
    // 未读数量
    badgeNumber?: number | null;
    describe?: string
    subTitle?: string | null;
    onPress?: () => void;
    bottomLine?: boolean;
    online?: boolean
    // 免打扰
    inhibite?: boolean
}
export default (props: IContactListItemProps) => {

    const renderPoint = () => {
        if (props.inhibite) {
            return <Image source={require('assets/icons/inhibite.svg')} style={{
                width: s(20), height: s(20)
            }} />
        }
        if (props.badgeNumber && props.badgeNumber > 0) {
            return <Image source={require('assets/icons/red-point.svg')} style={{
                width: s(6), height: s(6)
            }} />
        }
        return null
    }

    return <TouchableOpacity onPress={props.onPress} style={{
        ...styles.container,
        borderBottomColor: props.bottomLine ? '#f4f4f4' : 'white',
        borderBottomWidth: 1,
    }}>
        <View style={styles.iconContainer}>
            <AvatarComponent url={props.icon ?? ''} online={props.online} />
        </View>
        {/* {
            props.renderAvatar ? (props.renderAvatar) : (<View style={styles.iconContainer}>
                <Image source={props.icon} style={styles.icon} />
                {
                    props.badgeNumber && props.badgeNumber > 0 ?
                        <View style={styles.badgeContainer}>
                            <Text style={styles.badgeText}>{props.badgeNumber > 99 ? 99 : props.badgeNumber}</Text>
                        </View> : null
                }
            </View>)
        } */}
        <View style={{
            ...styles.rightContainer,
        }}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{props.title}</Text>
                <Text style={styles.describe}>{props.describe}</Text>
            </View>
            <View style={styles.subTitleContainer}>
                <Text style={styles.subTitle}>{props.subTitle}</Text>
                <View style={{
                    ...styles.subTitleContainer,
                    minWidth: s(20)
                }}>
                    {renderPoint()}
                </View>
            </View>
        </View>
    </TouchableOpacity>
}

const styles = StyleSheet.create({
    container: {
        height: s(76),
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
    },
    iconContainer: {
        width: s(57),
        height: s(76),
        display: 'flex',
        justifyContent: 'center',
    },
    icon: {
        width: s(48),
        height: s(48),
        borderRadius: s(24),
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
    },
    titleContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    title: {
        fontWeight: '600',
        fontSize: 16,
        color: '#000000',
        marginBottom: s(8)
    },
    describe: {
        fontWeight: '400',
        fontSize: 12,
        color: '#9CA3AF',
    },
    subTitleContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // alignItems: 'flex-end',
        flexDirection: 'row'
    },
    subTitle: {
        color: '#999',
        fontWeight: '400',
        fontSize: 12,
        marginRight: s(12),
    }
});
