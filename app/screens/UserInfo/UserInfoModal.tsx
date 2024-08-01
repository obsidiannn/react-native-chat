import { StyleSheet, Text, View } from "react-native";
import friendService from 'app/services/friend.service'
import userService from 'app/services/user.service'
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import InfoCard from "./components/info-card";
import { IUser } from "drizzle/schema";
import chatService from "app/services/chat.service";
import { useTranslation } from 'react-i18next';
import { s, verticalScale } from "app/utils/size";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import { navigate } from "app/navigators";
import { ScreenModal, ScreenModalType } from "app/components/ScreenModal";
import BlockButton from "app/components/BlockButton";


export interface UserInfoModalType {
    open: (userId: number, selfId: number) => void
}

export default forwardRef((_, ref) => {
    const [selfId, setSelfId] = useState<number>(0)
    const [user, setUser] = useState<IUser | null>(null);
    const themeColor = useRecoilValue(ColorsState)
    const { t } = useTranslation('screens')
    const screenModalRef = useRef<ScreenModalType>(null)

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
            screenModalRef.current?.open()
        }
    }));

    return (
        <ScreenModal ref={screenModalRef} title="">
            {user ?
                <View style={{ flex: 1,backgroundColor:"red" }}>
                    <View style={{
                        backgroundColor: themeColor.secondaryBackground,
                    }}>
                        <InfoCard user={user} />
                    </View>
                    <View style={{
                        flex: 1,
                        width: s(343),
                        paddingHorizontal: s(16),
                        alignItems: 'center',
                        marginTop: verticalScale(40),
                        backgroundColor:"red"
                    }}>
                        {
                            selfId !== user?.id ?
                                <BlockButton
                                    onPress={() => {

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
                                    label={user.isFriend ? t('userInfo.label_start_chat') : t('userInfo.label_add_friend')}
                                /> : null
                        }

                    </View>
                </View> : null}

        </ScreenModal>
    );
})

const styles = StyleSheet.create({

});
