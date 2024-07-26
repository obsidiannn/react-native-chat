import { StyleSheet, Text, View } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import friendService from 'app/services/friend.service'
import userService from 'app/services/user.service'
import { useEffect, useState } from "react";
import InfoCard from "./components/info-card";
import RemarkCard from "./components/remark-card";
import { IUser } from "drizzle/schema";
import chatService from "app/services/chat.service";
import { useTranslation } from 'react-i18next';
import { App } from "types/app";
import Navbar from "app/components/Navbar";
import { scale, verticalScale } from "app/utils/size";
import { Button } from "app/components";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import Icon from "app/components/Icon";
import { IModel } from "@repo/enums";


type Props = StackScreenProps<App.StackParamList, 'UserInfoScreen'>;
export const UserInfoScreen = ({ navigation, route }: Props) => {
    const insets = useSafeAreaInsets();
    const [user, setUser] = useState<IUser>();
    const { t } = useTranslation('screens')
    const themeColor = useRecoilValue(ColorsState)
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            const userId = route.params.userId;
            const u = await userService.findById(userId);
            if (u) {
                friendService.getReleationList([u.id]).then(res => {
                    const item = res.items.find(item => item.userId === u.id);
                    if (item) {
                        setUser({
                            ...u,
                            isFriend: item.status == true ? 1 : 0,
                        } as IUser)
                    }
                })
            }
        });
        return unsubscribe;
    }, [navigation])

    const renderLabel = (isFriend: number) => {
        if (isFriend === IModel.ICommon.ICommonBoolEnum.YES) {
            return <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Icon path={require("assets/icons/chat-box.svg")} />
                <Text style={{
                    color: themeColor.textChoosed
                }}>{t('userInfo.label_start_chat')}
                </Text>
            </View>
        } else {
            return <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Icon path={require("assets/icons/chat-box.svg")} />
                <Text style={{
                    color: themeColor.textChoosed
                }}>{t('userInfo.label_add_friend')}
                </Text>
            </View>
        }
    }

    return (
        <View style={{
            ...styles.container,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
        }}>
            <Navbar title={t('userInfo.title_user_info')}
                onLeftPress={() => {
                    if (route.params.outside) {
                        navigation.replace('TabStack')
                    } else {
                        navigation.goBack()
                    }
                }}
            />
            {user ?
                <View style={{ flex: 1 }}>
                    <View style={{
                        backgroundColor: themeColor.secondaryBackground,
                        paddingTop: scale(48)
                    }}>
                        <InfoCard user={user} />
                    </View>
                    <View style={{
                        paddingHorizontal: scale(16),
                        alignItems: 'center',
                        marginTop: verticalScale(40),
                    }}>
                        <Button style={{
                            width: '100%',
                            height: verticalScale(50),
                            borderRadius: verticalScale(16),
                            backgroundColor: themeColor.primary
                        }} onPress={() => {

                            if (!user.isFriend) {
                                navigation.navigate('InviteFriendScreen', {
                                    userId: user.id
                                })
                            } else {
                                chatService.getChatIdByUserId(user.id).then(id => {
                                    if (id !== null) {
                                        chatService.mineChatList(id).then(res => {
                                            if (res.length > 0) {
                                                console.log(res[0]);
                                                navigation.navigate('UserChatScreen', {
                                                    item: res[0]
                                                })
                                            }

                                        })
                                    }
                                })

                            }
                        }}
                        >
                            {
                                renderLabel(user.isFriend)
                            }
                        </Button>
                    </View>
                </View> : null}

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
}); 