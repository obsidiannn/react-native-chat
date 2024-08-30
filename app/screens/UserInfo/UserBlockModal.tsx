import { View } from "react-native";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import InfoCard from "./components/info-card";
import { IUser } from "drizzle/schema";
import { s } from "app/utils/size";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import { Button } from "app/components";
import UserConfigModal, { UserConfigModalType } from "./UserConfigModal";
import friendService from "app/services/friend.service";
import chatService from "app/services/chat.service";
import eventUtil from "app/utils/event-util";
import { useTranslation } from "react-i18next";
import { ScreenModal, ScreenModalType } from "app/components/ScreenModal";


export interface UserBlockModalType {
    open: (user: IUser) => void
}

export default forwardRef((props: {
    theme: 'light' | 'dark'
}, ref) => {
    const [user, setUser] = useState<IUser | null>(null);
    const themeColor = useRecoilValue(ColorsState)
    const userConfigModalRef = useRef<UserConfigModalType>(null)

    const onClose = () => {
        setUser(null)
        screenModalRef.current?.close()
    }

    useImperativeHandle(ref, () => ({
        open: async (user: IUser) => {
            setUser(user)
            screenModalRef.current?.open()
        }
    }));

    const {t} = useTranslation('default')
    const screenModalRef = useRef<ScreenModalType>(null)
    return (
        <ScreenModal theme={props.theme} ref={screenModalRef}>
            {user ?
                <View style={{ flex: 1, backgroundColor: themeColor.background }}>
                    <View style={{
                        backgroundColor: themeColor.secondaryBackground,
                        paddingTop: s(36)
                    }}>
                        <InfoCard theme={props.theme} user={user} />
                    </View>
                    <View style={{
                        paddingHorizontal: s(16),
                    }}>
                        <Button
                            theme={props.theme}
                            fullRounded fullWidth
                            size="large"
                            onPress={async () => {

                                if (user && user.friendId) {
                                    console.log(user);
                                    const chatId = await friendService.blockOut(user.friendId)
                                    if (chatId) {
                                        const chat = await chatService.mineChatList([chatId])
                                        eventUtil.sendChatEvent(chatId, 'add', chat[0])
                                    }
                                    eventUtil.sendFriendChangeEvent(user.id ?? 0, false)
                                    onClose()
                                }
                            }}
                            label={t('Remove from blacklist')}
                        />
                    </View>
                </View> : null}
            <UserConfigModal theme={props.theme} ref={userConfigModalRef} friend={user} />
        </ScreenModal>
    );
})