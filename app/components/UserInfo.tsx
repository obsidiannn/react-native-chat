import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as clipboard from 'expo-clipboard';
import { Image } from "expo-image";
import { IUser } from "drizzle/schema";
import { useTranslation } from 'react-i18next';
import { scale, verticalScale } from "app/utils/size";
import toast from "app/utils/toast";
export default (props: {
    user: IUser;
}) => {
    const { t } = useTranslation('screens')
    return <View style={styles.container}>
        <Image style={styles.avatar} source={props.user.avatar} />
        <View style={{
            display: 'flex',
            flexDirection: 'column',
            padding: scale(8),
            justifyContent: 'center'
        }}>
            <Text style={styles.nameText}>{props.user.nickName}</Text>
            <TouchableOpacity onPress={async () => {
                await clipboard.setStringAsync(props.user.userName ?? "");
                toast(t('common.success_copied'));
            }} style={styles.addressContainer}>
                <Text style={styles.addressText}>{props.user.userName ?? ""} numberOfLines={2}</Text>
                <Image style={styles.icon} source={require('assets/icons/copy.svg')} />
            </TouchableOpacity>
        </View>
    </View>
}
const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: '#F4F4F4',
        backgroundColor: '#F8F8F8',
        width: '100%',
        borderRadius: verticalScale(16),
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(15),
    },
    avatar: {
        width: verticalScale(50),
        height: verticalScale(50),
        borderRadius: verticalScale(25),
        borderWidth: 1,
        borderColor: '#F0F0F0',
        marginRight: scale(15),
    },
    nameText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000'
    },
    addressContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    addressText: {
        fontSize: 14,
        color: '#999',
        fontWeight: '400',
        flexWrap: 'wrap'
    },
    icon: {
        width: verticalScale(20),
        height: verticalScale(20),
    }
});