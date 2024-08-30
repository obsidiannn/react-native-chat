import { View } from "react-native";
import friendService from 'app/services/friend.service'
import userService from 'app/services/user.service'
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import InfoCard from "./components/info-card";
import { IUser } from "drizzle/schema";
import { useTranslation } from 'react-i18next';
import { s } from "app/utils/size";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import { navigate } from "app/navigators";
import { Button } from "app/components";
import UserConfigModal, { UserConfigModalType } from "./UserConfigModal";
import { ScreenModal, ScreenModalType } from "app/components/ScreenModal";


export interface UserInfoModalType {
    open: (userId: number, selfId: number) => void
}

export default forwardRef((props: {
    user?: IUser;
    theme: 'light' | 'dark';
}, ref) => {
    const [selfId, setSelfId] = useState<number>(0)
    const [user, setUser] = useState<IUser | null>(null);
    const themeColor = useRecoilValue(ColorsState)
    const userConfigModalRef = useRef<UserConfigModalType>(null)
    const { t } = useTranslation('default')

    useImperativeHandle(ref, () => ({
        open: async (userId: number, selfId: number) => {
            if (userId <= 0) { return }
            const u = props.user ?? await userService.findById(userId);

            setSelfId(selfId)
            if (u && userId !== selfId) {
                friendService.getReleationList([u.id]).then(res => {
                    const item = res.items.find(item => item.userId === u.id);
                    if (item) {
                        setUser({
                            ...u,
                            friendId: item.friendId,
                            isFriend: item.status == true ? 1 : 0,
                            chatId: item.chatId
                        } as IUser)
                    }
                })
            } else {
                setUser(u)
            }
            screenModalRef.current?.open();
        }
    }));
    const RenderButton = () => {
        if (!user) {
            return null
        }
        if (selfId === user.id) {
            return null
        }

        if (user.isFriend === 0) {
            // 非好友
            return <Button
                fullRounded fullWidth
                size="large"
                onPress={() => {
                    navigate('InviteFriendScreen', {
                        userId: user.id
                    })
                }}
                label={t('Add friend')}
            />
        } else {
            return <Button
                theme={props.theme}
                fullRounded fullWidth
                size="large"
                onPress={() => {
                    if (user.chatId && user.chatId !== '') {
                        navigate('UserChatScreen', {
                            chatId: user.chatId
                        })
                    }
                }}
                label={t('Send Message')}
            />
        }
    }
    const screenModalRef = useRef<ScreenModalType>(null)
    return (
        <ScreenModal ref={screenModalRef} theme={props.theme} renderRight={<RenderButton/>} >
            {user ?
                <View style={{
                    flex: 1,
                    backgroundColor: themeColor.background,
                    borderTopLeftRadius: s(24),
                    borderTopRightRadius: s(24),
                }}>
                    <View style={{
                        backgroundColor: themeColor.secondaryBackground,
                        paddingTop: s(36)
                    }}>
                        <InfoCard theme={props.theme} user={user} />
                    </View>
                    <View style={{
                        paddingHorizontal: s(16),
                    }}>
                        <RenderButton/>
                    </View>
                </View> : null}
            <UserConfigModal theme={props.theme} ref={userConfigModalRef} friend={user} />
        </ScreenModal>
    );
})