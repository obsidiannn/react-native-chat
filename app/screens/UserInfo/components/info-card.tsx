import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import * as clipboard from 'expo-clipboard';
import { IUser } from "drizzle/schema";
import { useTranslation } from 'react-i18next';
import toast from "app/utils/toast";
import { s, verticalScale } from "app/utils/size";
import { isOnline } from "app/utils/account";
import { IModel } from "@repo/enums";
import { colors } from "app/theme";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import strUtil from "app/utils/str-util";
import { IconFont } from "app/components/IconFont/IconFont";
import AvatarComponent from "app/components/Avatar";
import fileService from "app/services/file.service";
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
                marginTop: s(-40)
            }}>
                {/* <AvatarComponent
                    width={64} height={64}
                    online={isOnline(user.updatedAt?.valueOf() ?? 0)}
                    enableAvatarBorder
                    url={fileService.getFullUrl(user.avatar ?? "")} /> */}
                <AvatarX border size={64}
                    online={isOnline(user.updatedAt?.valueOf() ?? 0)}
                    uri={fileService.getFullUrl(user.avatar ?? '')} />

            </View>
            <View style={styles.rightContainer}>
                <Text style={styles.nameText}>{user.nickName}</Text>
                {
                    user.gender !== IModel.IUser.Gender.UNKNOWN ?
                        (
                            <IconFont name={user.gender === IModel.IUser.Gender.MALE ? "men" : "women"} color={$colors.text} />
                        ) : null
                }

            </View>

            <TouchableOpacity style={styles.infoContainer} onPress={async () => {
                await clipboard.setStringAsync(user.userName ?? '');
                toast(t('userInfo.success_copied'));
            }}>
                <Text style={styles.signText}>@{strUtil.truncateMiddle(user.userName, 30)}</Text>
                <IconFont name={"copy"} color={$colors.text} size={16} />
            </TouchableOpacity>
        </View>
        <View style={styles.signContainer}>
            <Text style={{
                ...styles.signText,
                color: colors.palette.gray500,
                paddingVertical: s(12)
            }}>{!user.sign ? t('userInfo.label_empty') : user.sign}</Text>
        </View>
    </View>
};

const styles = StyleSheet.create({
    container: {
        borderRadius: s(16),
        padding: s(16),
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
        marginTop: s(24)
    },
    nameText: {
        fontSize: s(30),
        fontWeight: '500',
        color: '#000',
    },
    infoContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: s(24),
        padding: s(4)
    },

    copyIcon: {
        width: s(24),
        height: s(24),
    },
    line: {
        height: 1,
        backgroundColor: '#ECECEC',
        marginLeft: s(50),
        marginTop: verticalScale(15),
        marginBottom: verticalScale(10),
    },
    signContainer: {
        padding: s(12),
        minHeight: s(64),
        backgroundColor: colors.palette.gray100,
        marginTop: s(24),
        borderRadius: s(14)

    },
    signText: {
        fontSize: s(16),
        fontWeight: '400',
        flexWrap: 'wrap'
    }
});
