import { View, TouchableOpacity } from "react-native";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import InfoCard from "./components/info-card";
import { IUser } from "drizzle/schema";
import { useTranslation } from 'react-i18next';
import { s } from "app/utils/size";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { ColorsState } from "app/stores/system";
import { Button } from "app/components";
import BaseModal from "app/components/base-modal";
import UserConfigModal, { UserConfigModalType } from "./UserConfigModal";
import friendService from "app/services/friend.service";
import { FriendChangeEvent } from "../../../../../packages/types/dist/client/message";
import { IModel } from "@repo/enums";
import EventManager from 'app/services/event-manager.service'
import { ChatsStore } from "app/stores/auth";
import chatService from "app/services/chat.service";


export interface UserBlockModalType {
    open: (user: IUser) => void
}

export default forwardRef((_, ref) => {
    const [user, setUser] = useState<IUser | null>(null);
    const themeColor = useRecoilValue(ColorsState)
    const [visible, setVisible] = useState<boolean>(false)
    const userConfigModalRef = useRef<UserConfigModalType>(null)

    const setChatsStore = useSetRecoilState(ChatsStore)

    const onClose = () => {
        setUser(null)
        setVisible(false)
    }

    useImperativeHandle(ref, () => ({
        open: async (user: IUser) => {
            setUser(user)
            setVisible(true)
        }
    }));


    return (
        <BaseModal visible={visible} title="" onClose={onClose} styles={{ flex: 1 }}>
            {user ?
                <View style={{ flex: 1, backgroundColor: themeColor.background }}>
                    <View style={{
                        backgroundColor: themeColor.secondaryBackground,
                        paddingTop: s(36)
                    }}>
                        <InfoCard user={user} />
                    </View>
                    <View style={{
                        paddingHorizontal: s(16),
                    }}>
                        <Button
                            size="large"
                            onPress={async () => {

                                if (user && user.friendId) {
                                    console.log(user);
                                    const chatId = await friendService.blockOut(user.friendId)
                                    if (chatId) {
                                        const chat = await chatService.mineChatList([chatId])
                                        setChatsStore(items => {
                                            const old = items.find(i => i.id === chatId)
                                            if (old) {
                                                return items
                                            } else {
                                                return items.concat(chat)
                                            }
                                        })
                                    }

                                    const event: FriendChangeEvent = {
                                        friendId: user.id ?? 0,
                                        remove: false,
                                        type: IModel.IClient.SocketTypeEnum.FRIEND_CHANGE
                                    }
                                    const eventKey = EventManager.generateKey(event.type)
                                    EventManager.emit(eventKey, event)

                                    onClose()
                                }
                            }}
                            label={'移出黑名单'}
                        />
                    </View>
                </View> : null}
            <UserConfigModal ref={userConfigModalRef} friend={user} />
        </BaseModal>
    );
})

// const styles = StyleSheet.create({

// });
