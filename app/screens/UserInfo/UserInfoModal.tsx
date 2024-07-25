import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import friendService from 'app/services/friend.service'
import userService from 'app/services/user.service'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import InfoCard from "./components/info-card";
import { IUser } from "drizzle/schema";
import chatService from "app/services/chat.service";
import { useTranslation } from 'react-i18next';
import { scale, verticalScale } from "app/utils/size";
import { Button } from "app/components";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import { AuthUser } from "app/stores/auth";
import BaseModal from "app/components/base-modal";
import { navigate } from "app/navigators";


export interface UserInfoModalType {
    open: (userId: number, selfId: number) => void
}

export default forwardRef((_, ref) => {
    const insets = useSafeAreaInsets();
    const [selfId, setSelfId] = useState<number>(0)
    const [user, setUser] = useState<IUser | null>(null);

    const [visible, setVisible] = useState(false);
    const themeColor = useRecoilValue(ColorsState)
    const { t } = useTranslation('screens')

    const onClose = () => {
        setUser(null)
        setVisible(false)
    }

    useImperativeHandle(ref, () => ({
        open: async (userId: number, selfId: number) => {
            if (userId <= 0) { return }
            const u = await userService.findById(userId);
            setSelfId(selfId)
            if (u && userId !== selfId) {
                friendService.getReleationList([u.id]).then(res => {
                    const item = res.items.find(item => item.userId === u.id);
                    if (item) {
                        setUser({
                            ...u,
                            isFriend: item.status == true ? 1 : 0,
                        } as IUser)
                    }
                })
            } else {
                setUser(u)
            }
            setVisible(true);
        }
    }));

    return (
        <BaseModal title="" visible={visible} onClose={onClose} styles={{
            flex: 1,
            backgroundColor: themeColor.secondaryBackground,
            paddingTop: scale(36),
        }}>
            {user ?
                <View style={{ flex: 1 }}>
                    <View style={{
                        backgroundColor: themeColor.secondaryBackground,
                    }}>
                        <InfoCard user={user} />
                    </View>

                    <View style={{
                        paddingHorizontal: scale(16),
                        alignItems: 'center',
                        marginTop: verticalScale(40),
                    }}>
                        {
                            selfId !== user?.id ?
                                <Button style={{
                                    width: '100%',
                                    height: verticalScale(50),
                                    borderRadius: verticalScale(16),
                                    backgroundColor: themeColor.primary
                                }} onPress={() => {

                                    if (!user.isFriend) {
                                        navigate('InviteFriendScreen', {
                                            userId: user.id
                                        })
                                    } else {
                                        chatService.getChatIdByUserId(user.id).then(id => {
                                            if (id !== null) {
                                                chatService.mineChatList(id).then(res => {
                                                    if (res.length > 0) {
                                                        console.log(res[0]);
                                                        navigate('UserChatScreen', {
                                                            item: res[0]
                                                        })
                                                    }

                                                })
                                            }
                                        })
                                    }
                                }}
                                >
                                    <Text style={{
                                        color: themeColor.textChoosed
                                    }}>{
                                            user.isFriend ? t('userInfo.label_start_chat') : t('userInfo.label_add_friend')
                                        } </Text>
                                </Button> : null
                        }

                    </View>
                </View> : null}

        </BaseModal>
    );
})

const styles = StyleSheet.create({

}); 