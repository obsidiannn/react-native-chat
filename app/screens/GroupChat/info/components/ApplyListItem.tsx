import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import { Image } from "expo-image";
import { GroupApplyItem } from "@repo/types";
import { useTranslation } from 'react-i18next';
import { IModel } from "@repo/enums";
import { s } from "app/utils/size";
dayjs.extend(relativeTime)
export default (props: {
    item: GroupApplyItem,
    isLast: boolean,
    onCheck: () => void;
}) => {
    const { item, isLast } = props;
    const {t} = useTranslation('common')
    return <TouchableOpacity onPress={() => {
        props.onCheck();
    }} style={styles.container}>
        <View style={styles.avatarContainer}>
            <Image source={item.avatar} style={styles.avatar} />
        </View>
        <View style={{
            ...styles.rightContainer,
            // borderBottomColor: isLast ? 'white' : '#F4F4F4',
            borderBottomColor: isLast ? 'white' : '#F4F4F4',
        }}>
            <View style={styles.nameContainer}>
                <Text style={styles.nameText}>{item.name}</Text>
            </View>
            <View style={styles.statusContainer}>
                <Text style={{
                    ...styles.statusText,
                    color: item.status === IModel.IGroup.IGroupMemberStatus.PENDING ? '#009B0F' : colors.gray400,
                }}>
                    {item.status === IModel.IGroup.IGroupMemberStatus.PENDING? t('group_status_pending'):null}
                    {item.status === IModel.IGroup.IGroupMemberStatus.NORMAL?  t('group_status_added'):null}
                    {item.status === IModel.IGroup.IGroupMemberStatus.REJECTED? t('group_status_rejected'):null}
                </Text>
            </View>
        </View>
    </TouchableOpacity>
}

const styles = StyleSheet.create({
    container: {
        height: s(76),
        width: '100%',
        paddingHorizontal: s(16),
        display: 'flex',
        flexDirection: 'row',
    },
    avatarContainer: {
        width: s(57),
        height: s(76),
        display: 'flex',
        justifyContent: 'center',
    },
    avatar: {
        width: s(48),
        height: s(48),
        borderRadius: s(24),
        marginRight: s(10),
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    rightContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    nameContainer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center'
    },
    nameText: {
        fontWeight: '400',
        fontSize: 16,
        color: '#000000',
    },
    statusContainer: {
        width: '30%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    statusText: {
        fontWeight: '400',
        fontSize: 12,
        textAlign: 'left',
        marginRight: s(6),
    }
});
