import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import * as clipboard from 'expo-clipboard';
import { Image } from "expo-image";
import { IUser } from "drizzle/schema";
import { useTranslation } from 'react-i18next';
import toast from "app/utils/toast";
import { scale, verticalScale } from "app/utils/size";
import { isOnline } from "app/utils/account";
import { IModel } from "@repo/enums";
import { colors } from "app/theme";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import AvatarX from "app/components/AvatarX";
export default (props: {
    user: IUser
}) => {
    const { user } = props;
    const { t } = useTranslation('screens')
    const $colors = useRecoilValue(ColorsState)
    return <View style={{
        ...styles.container,
        backgroundColor: $colors.background
    }}>
        <View style={styles.infoBox}>
            <View style={{
                marginTop: scale(-40)
            }}>
                <AvatarX size={72} online={isOnline(user.updatedAt?.valueOf() ?? 0)} border={true} uri={user.avatar ?? ""} />
            </View>
            <View style={styles.rightContainer}>
                <Text style={styles.nameText}>{user.nickName}</Text>
                {
                    user.gender !== IModel.IUser.Gender.UNKNOWN ?
                        (
                            <Image source={user.gender === IModel.IUser.Gender.MALE ? require('assets/icons/male.svg') : require('assets/icons/female.svg')}
                                style={{
                                    width: scale(36),
                                    height: scale(36)
                                }}
                            />
                        ) : null
                }

            </View>

            <TouchableOpacity style={styles.infoContainer} onPress={async () => {
                await clipboard.setStringAsync(user.userName ?? '');
                toast(t('userInfo.success_copied'));
            }}>
                <Text style={styles.signText}>@{user.userName}</Text>
                <Image source={require('assets/icons/copy.svg')} style={styles.copyIcon} />
            </TouchableOpacity>
        </View>
        <View style={styles.signContainer}>
            <Text style={styles.signText}>{user.sign == '' ? t('label_empty') : user.sign}</Text>
        </View>
    </View>
};

const styles = StyleSheet.create({
    container: {
        borderRadius: scale(16),
        padding: scale(16),
    },
    infoBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    rightContainer: {
        borderColor: '#F0F0F0',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: scale(24)
    },
    nameText: {
        fontSize: scale(30),
        fontWeight: '500',
        color: '#000',
    },
    infoContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: scale(24),
        padding: scale(4)
    },

    copyIcon: {
        width: scale(24),
        height: scale(24),
    },
    line: {
        height: 1,
        backgroundColor: '#ECECEC',
        marginLeft: scale(50),
        marginTop: verticalScale(15),
        marginBottom: verticalScale(10),
    },
    signContainer: {
        padding: scale(12),
        minHeight: scale(64),
        backgroundColor: colors.palette.gray100,
        marginTop: scale(24),
        borderRadius: scale(14)

    },
    signText: {
        fontSize: scale(16),
        fontWeight: '400',
        color: '#999',
        flexWrap: 'wrap'
    }
});