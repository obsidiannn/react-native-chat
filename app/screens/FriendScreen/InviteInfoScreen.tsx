import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import friendApplyService from "app/services/friend-apply.service";
import { IUser } from "drizzle/schema";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useTranslation } from 'react-i18next';
import { s, verticalScale } from "app/utils/size";
import Navbar from "app/components/Navbar";
import { Button } from "app/components";
import { AuthUser, ChatsStore } from "app/stores/auth";
import { ColorsState } from "app/stores/system";
import { FriendChangeEvent, IServer } from "@repo/types";
import { App } from "types/app";
import { IModel } from "@repo/enums";
import InfoCard from "../UserInfo/components/info-card";
import chatService from "app/services/chat.service";
import EventManager from 'app/services/event-manager.service'

type Props = StackScreenProps<App.StackParamList, 'InviteInfoScreen'>;
export const InviteInfoScreen = ({ navigation, route }: Props) => {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const setChatStore = useSetRecoilState(ChatsStore)
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
                <View style={{
                    paddingTop: verticalScale(32),
                    backgroundColor: themeColor.secondaryBackground
                }}>
                    {info?.user && <InfoCard user={info.user} />}
                </View>
                {
                    info?.friendApply.remark ? (
                        <View style={styles.infoContainer}>
                            <View style={{
                                borderWidth: 1,
                                borderColor: '#F4F4F4',
                                backgroundColor: '#F8F8F8',
                                width: '100%',
                                borderRadius: verticalScale(16),
                                paddingHorizontal: s(15),
                                paddingVertical: verticalScale(17),
                                marginTop: verticalScale(10),
                            }}>
                                <Text style={{
                                    fontSize: 16,
                                    color: '#333'
                                }}>{info?.friendApply.remark ?? ''}</Text>
                            </View>
                        </View>
                    ) : null
                }

                <View style={styles.actionContainer}>
                    {info?.friendApply.status === IModel.IFriendApply.Status.PENDING && !info.isSelf ? <>
                        <Button fullWidth size="large" onPress={async () => {
                            if (loading) {
                                return
                            };
                            try {
                                const res = await friendApplyService.agree(info.friendApply.id)
                                if (res && res.chatId) {
                                    const chats = await chatService.mineChatList([res.chatId])
                                    if (chats.length > 0) {
                                        setChatStore(items => {
                                            const chat = items.find(i => i.id === res.chatId)
                                            if (!chat) {
                                                return items.concat(chats[0])
                                            }
                                            return items
                                        })

                                        const eventKey = EventManager.generateKey(IModel.IClient.SocketTypeEnum.FRIEND_CHANGE)
                                        EventManager.emit(eventKey, {
                                            friendId: res.friendId ?? 0,
                                            remove: false
                                        } as FriendChangeEvent)
                                    }
                                }
                            } catch (e) {

                            } finally {
                                setLoading(false);
                                navigation.goBack();
                            }

                        }} label={t('friend.btn_apply')} />

                        <Button type="secondary" containerStyle={{
                            marginTop: s(10)
                        }} fullWidth size="large" onPress={async () => {
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
                        }} label={t('friend.btn_reject')} />
                    </> : null}

                    {info?.friendApply.status === IModel.IFriendApply.Status.PENDING && info.isSelf ?
                        <Button label={t('friend.label_pending')} disabled size="large"
                        // icon={<IconFont name="restart"}
                        /> : null}
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
        paddingHorizontal: s(15),
        paddingTop: verticalScale(21)
    },
    actionContainer: {
        paddingHorizontal: s(15),
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
