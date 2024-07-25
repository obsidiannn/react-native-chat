import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import friendApplyService from "app/services/friend-apply.service";
import { IUser } from "drizzle/schema";
import { useRecoilValue } from "recoil";
import { useTranslation } from 'react-i18next';
import { scale, verticalScale } from "app/utils/size";
import Navbar from "app/components/Navbar";
import { Button } from "app/components";
import { AuthUser } from "app/stores/auth";
import { ColorsState } from "app/stores/system";
import { IServer } from "@repo/types";
import { App } from "types/app";
import { IModel } from "@repo/enums";
import UserInfo from "app/components/UserInfo";
type Props = StackScreenProps<App.StackParamList, 'InviteInfoScreen'>;
export const InviteInfoScreen = ({ navigation, route }: Props) => {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const [remark, setRemark] = useState<string>('');
    const themeColor = useRecoilValue(ColorsState)
    const currentUser = useRecoilValue(AuthUser)
    const { t } = useTranslation('screens')
    const [info, setInfo] = useState<{
        friendApply: IServer.IFriendApply;
        user: IUser;
        isSelf: boolean;
    }>();
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (currentUser) {
                const { friendApply, user } = route.params;
                console.log("currentUser.id === friendApply.userId", currentUser.id === friendApply.userId)
                setInfo({
                    friendApply,
                    user,
                    isSelf: currentUser.id === friendApply.userId
                })
            }

        });
        return unsubscribe;
    }, [navigation])
    return (
        <View style={{
            ...styles.container,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
        }}>
            <View>
                <Navbar title={t('friend.title_apply_info')} />
            </View>
            <ScrollView keyboardDismissMode="interactive">
                <View style={styles.infoContainer}>
                    {info?.user && <UserInfo user={info.user} />}
                    <View style={{
                        borderWidth: 1,
                        borderColor: '#F4F4F4',
                        backgroundColor: '#F8F8F8',
                        width: '100%',
                        borderRadius: verticalScale(16),
                        paddingHorizontal: scale(15),
                        paddingVertical: verticalScale(17),
                        marginTop: verticalScale(10),
                    }}>
                        <Text style={{
                            fontSize: 16,
                            color: '#333'
                        }}>{info?.friendApply.remark ?? ''}</Text>
                    </View>
                    {info?.friendApply.status === 1 && !info.isSelf ? <View style={{
                        height: verticalScale(50),
                        borderRadius: verticalScale(25),
                        backgroundColor: '#F8F8F8',
                        borderWidth: 1,
                        borderColor: '#F4F4F4',
                        display: 'flex',
                        flexDirection: 'row',
                        paddingHorizontal: scale(15),
                        marginTop: verticalScale(20),
                    }}>
                        <TextInput value={remark} onChangeText={(v) => setRemark(v)} placeholder={t('placeholder_remark')} style={{
                            flex: 1
                        }} />
                        <Image source={require('assets/icons/edit.svg')} style={{
                            width: verticalScale(20),
                            height: verticalScale(20),
                            marginLeft: scale(15),
                            marginTop: verticalScale(15),
                        }} />
                    </View> : null}
                </View>
                <View style={styles.actionContainer}>
                    {info?.friendApply.status === IModel.IFriendApply.Status.PENDING && !info.isSelf ? <>
                        <Button style={{ ...styles.accpetButton, backgroundColor: themeColor.primary }} onPress={() => {
                            if (loading) {
                                return
                            };
                            setLoading(true);
                            friendApplyService.agree(info.friendApply.id).then(() => {
                                navigation.goBack();
                            }).finally(() => {
                                setLoading(false);
                            });
                        }} >
                            <Text style={styles.label}>{t('friend.btn_apply')} </Text>
                        </Button>
                        <Button style={{ ...styles.rejectButton, backgroundColor: themeColor.background }} onPress={async () => {
                            if (loading) {
                                return
                            };
                            setLoading(true);
                            friendApplyService.reject(info.friendApply.id, "").then(() => {
                                navigation.goBack();
                            }).finally(() => {
                                navigation.goBack();
                                setLoading(false);
                            });
                        }} >
                            <Text style={{ ...styles.label, color: themeColor.primary }}>{t('friend.btn_reject')} </Text>
                        </Button>
                    </> : null}
                    {info?.friendApply.status === IModel.IFriendApply.Status.PENDING && info.isSelf ? <Button disabled={true} style={{
                        ...styles.waitButton,
                        backgroundColor: themeColor.primary
                    }}  >
                        <Text style={styles.label}>{t('friend.label_pending')} </Text>
                    </Button> : null}
                </View>
            </ScrollView>
        </View>
    );
}; 

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    infoContainer: {
        paddingHorizontal: scale(15),
        paddingTop: verticalScale(21)
    },
    actionContainer: {
        paddingHorizontal: scale(23),
        marginTop: verticalScale(100),
    },
    accpetButton: {
        width: '100%',
        height: verticalScale(50),
        borderRadius: verticalScale(16),
        marginTop: verticalScale(30),
    },
    rejectButton: {
        width: '100%',
        height: verticalScale(50),
        borderRadius: verticalScale(16),
        marginTop: verticalScale(16),
    },
    waitButton: {
        width: '100%',
        height: verticalScale(50),
        borderRadius: verticalScale(16),
        marginTop: verticalScale(30),
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
    }
});