import { useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { useTranslation } from 'react-i18next';
import { App } from "types/app";
import friendApplyService from "app/services/friend-apply.service";
import { Button } from "app/components";
import toast from "app/utils/toast";
import { s, verticalScale } from "app/utils/size";
import { ScreenX } from "app/components/ScreenX";
import { useRecoilValue } from "recoil";
import { ThemeState } from "app/stores/system";

type Props = StackScreenProps<App.StackParamList, 'InviteFriendScreen'>;
export const InviteFriendScreen = ({ navigation, route }: Props) => {
    const [userId, setUserId] = useState<number>();
    const [remark, setRemark] = useState('');
    const $theme = useRecoilValue(ThemeState)
    const [state, setState] = useState(false)
    const { t } = useTranslation('screens')
    useEffect(() => {
        // 監聽頁面獲取焦點
        const unsubscribe = navigation.addListener('focus', () => {
            setUserId(route.params.userId);
        });
        return unsubscribe;
    }, [navigation])
    return <ScreenX title={t('friend.title_invite_info')} theme={$theme}>
        <View style={styles.contentContainer} >
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder={t('friend.placeholder_remark')}
                    onChangeText={text => setRemark(text)}
                    defaultValue={remark}
                    multiline={true}
                    numberOfLines={5}
                    maxLength={120}
                />
            </View>
            <View style={styles.buttonContainer}>
                <Button size="large" fullWidth label={t('friend.btn_send_invite')} onPress={() => {
                    setState(true);
                    if (userId) {
                        friendApplyService.create(userId, remark).then(res => {
                            toast(
                                t('friend.success_send_invite')
                            );
                            setTimeout(() => {
                                navigation.goBack();
                            }, 1000);
                        }).finally(() => {
                            setState(false)
                        })
                    }
                }} />
            </View>
        </View>
    </ScreenX>
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contentContainer: {
    },
    inputContainer: {
        height: '50%',
        padding: s(15),
        borderColor: '#F4F4F4',
        borderWidth: 1,
        backgroundColor: '#F8F8F8',
        marginHorizontal: s(15),
        borderRadius: s(16),
        marginTop: verticalScale(20),
    },
    input: {
        fontSize: 16,
        fontWeight: '400',
        color: '#333',
        height: verticalScale(82),
    },
    buttonContainer: {
        paddingHorizontal: s(23),
        marginTop: verticalScale(30),
    },
    button: {
        width: '100%',
        height: verticalScale(50),
        borderRadius: verticalScale(16)
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '700',
    }
});
