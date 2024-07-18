import { StyleSheet, View, Switch } from "react-native";
import { useRef, useState, useContext } from "react";
import ConfirmModal, { ConfirmModalType } from "app/components/confirm-modal";
import messageSenderService from "app/services/message-send.service";
import InfoCard from "./ChatInfoCard";
import ActionItem from "./action-item";
import { ClearChatMessageEvent } from "@repo/types";
import { IModel } from "@repo/enums";
import EventManager from 'app/services/events'
import chatApi from "@/api/chat/chat";
import { scale } from "app/utils/size";
import Navbar from "app/components/Navbar";
import { useRoute } from "@react-navigation/native";
import { colors } from "app/theme";
import { translate } from "app/i18n";
import { Image } from "expo-image";
import toast from "app/utils/toast";
import { UserChatUIContext } from "./context";

export default function ({ navigation }) {
    const route = useRoute()
    const userChatContext = useContext(UserChatUIContext)
    const confirmModalRef = useRef<ConfirmModalType>(null);
    const [disturb, setDisturb] = useState(false)
    // const [visible, setVisible] = useState<boolean>(false)
    const onClose = () => {
        navigation.goBack()
    }

    return (
        <View style={{
            flex: 1,
            ...styles
        }}>
            <Navbar onLeftPress={onClose} />
            <View style={{
                paddingHorizontal: scale(25),
                marginTop: scale(20),
            }}>
                <InfoCard avatar={userChatContext.friend?.avatar ?? ''} name={userChatContext.friend?.remark ?? userChatContext.friend?.nickName ?? ''} />
                <View style={{
                    marginTop: scale(15),
                }}>
                    <ActionItem title={translate('chat.btn_bother_ignore')}
                        rightComponent={<Switch height={scale(24)}
                            onColor={colors.palette.primary} value={disturb} onValueChange={(v) => {
                                setDisturb(v)
                            }} />} />
                </View>
                <View style={{
                    marginTop: scale(15),
                }}>
                    <ActionItem title={t('chat.btn_chat_top')}
                        rightComponent={<Switch height={scale(24)} onColor={colors.primary}
                            value={(userChatContext.chatItem?.isTop ?? IModel.ICommon.ICommonBoolEnum.NO) === IModel.ICommon.ICommonBoolEnum.NO}
                            onValueChange={(v) => {
                                if (userChatContext.chatItem) {
                                    chatApi.raiseTop({
                                        chatUserId: userChatContext.chatItem.chatUserId,
                                        top: v
                                    }).then(res => {
                                        userChatContext.setContextTop(res.isTop)
                                    })
                                }
                            }} />} />
                </View>
                <View style={{
                    marginTop: scale(15),
                }}>
                    <ActionItem onPress={() => {
                        confirmModalRef.current?.open({
                            title: translate('chat.btn_message_delete'),
                            desc: translate('chat.btn_message_delete_desc'),
                            onSubmit: () => {
                                messageSenderService.clearMineMessage([userChatContext.chatItem.id]).then(() => {
                                    const event: ClearChatMessageEvent = { chatId: userChatContext.chatItem.id, type: IModel.IClient.SocketTypeEnum.CLEAR_ALL_MESSAGE }
                                    const eventKey = EventManager.generateChatTopic(userChatContext.chatItem.id)
                                    EventManager.emit(eventKey, event)
                                    toast(translate('chat.success_cleaned'))
                                })
                            }
                        })
                    }} title={translate('chat.btn_message_delete')} textColor="#FB3737" rightComponent={<Image source={require('assets/icons/arrow-right-gray.svg')} style={{
                        width: scale(20),
                        height: scale(20),
                    }} />} />
                </View>
            </View>
            <ConfirmModal ref={confirmModalRef} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
});
