import { StyleSheet, View, Switch } from "react-native";
import { useRef, useState, useContext, useMemo } from "react";
import ConfirmModal, { ConfirmModalType } from "app/components/confirm-modal";
import messageSenderService from "app/services/message-send.service";
import ActionItem from "./action-item";
import { ChatDetailItem, ClearChatMessageEvent } from "@repo/types";
import { IModel } from "@repo/enums";
import EventManager from 'app/services/event-manager.service'
import chatApi from "app/api/chat/chat";
import { scale } from "app/utils/size";
import Navbar from "app/components/Navbar";
import { colors } from "app/theme";
import { Image } from "expo-image";
import toast from "app/utils/toast";
import { useTranslation } from "react-i18next";
import { useRecoilState, useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
import { ChatsStore } from "app/stores/auth";



export default function ({ navigation, route }) {
    // const route = useRoute()
    console.log(route.params);
    const user = route.params
    const chatId = route.params.chatId

    const [chatsStore, setChatsStore] = useRecoilState(ChatsStore)
    

    const { t } = useTranslation('screens')
    const theme = useRecoilValue(ColorsState)
    const confirmModalRef = useRef<ConfirmModalType>(null);
  
    const changeTop = (chatIdVal: string, val: number) => {
        setChatsStore((items) => {
            const newItems = items.map(t => {
                if (chatIdVal === t.id) {
                    return { ...t, isTop: val }
                }
                return t
            })
            return newItems
        })
    }

    const changeMute = (chatIdVal: string, val: number) => {
        setChatsStore((items) => {
            const newItems = items.map(t => {
                if (chatIdVal === t.id) {
                    return { ...t, isMute: val }
                }
                return t
            })
            return newItems
        })
    }

    const chat = useMemo(() => {
        const chatDetails = chatsStore.filter(c => c.id = chatId)
      
        if (chatDetails.length > 0) {
            console.log('chat has changed',chatDetails[0]);
            return chatDetails[0]
        }
        return null
    }, [chatsStore, chatId])

    const onClose = () => {
        navigation.goBack()
    }

    return (
        <View style={{
            flex: 1,
            ...styles,
            backgroundColor: theme.background
        }}>
            <Navbar onLeftPress={onClose} />
            <View style={{
                paddingHorizontal: scale(25),
                marginTop: scale(20),
            }}>
                <View style={{
                    marginTop: scale(15),
                }}>
                    <ActionItem title={'查看个人资料'}
                        onPress={() => {
                            console.log('press');
                        }}
                        leftComponent={
                            <Image source={require('assets/icons/personal.svg')} style={{
                                width: scale(20),
                                height: scale(20),
                                marginRight: scale(8)
                            }} />
                        }
                        rightComponent={
                            <Image source={require('assets/icons/arrow-right-gray.svg')} style={{
                                width: scale(20),
                                height: scale(20),
                            }} />
                        } />
                </View>

                <View style={{
                    marginTop: scale(15),
                }}>
                    <ActionItem title={'消息免打扰'}
                        leftComponent={
                            <Image source={require('assets/icons/off.svg')} style={{
                                width: scale(20),
                                height: scale(20),
                                marginRight: scale(8)
                            }} />
                        }
                        rightComponent={<Switch height={scale(24)}

                            onColor={colors.palette.primary} value={
                                chat?.isMute === IModel.ICommon.ICommonBoolEnum.YES
                            } onValueChange={(v) => {
                            }} />} />
                </View>


                <View style={{
                    marginTop: scale(15),
                }}>
                    <ActionItem title={t('chat.btn_chat_top')}
                        leftComponent={
                            <Image source={require('assets/icons/top.svg')} style={{
                                width: scale(20),
                                height: scale(20),
                                marginRight: scale(8)
                            }} />
                        }
                        rightComponent={<Switch height={scale(24)} onColor={colors.palette.primary}
                            value={
                                chat?.isTop === IModel.ICommon.ICommonBoolEnum.YES
                            }
                            onValueChange={(v) => {
                                if (chat) {
                                    chatApi.raiseTop({
                                        chatUserId: chat.chatUserId ?? '',
                                        top: v
                                    }).then(res => {
                                        changeTop(chat.id, res.isTop)
                                    })
                                }
                            }} />} />
                </View>

                <View style={{
                    marginTop: scale(15),
                }}>
                    <ActionItem title={'查找聊天内容'}
                        leftComponent={
                            <Image source={require('assets/icons/search.svg')} style={{
                                width: scale(20),
                                height: scale(20),
                                marginRight: scale(8)
                            }} />
                        }
                        rightComponent={<Image source={require('assets/icons/arrow-right-gray.svg')} style={{
                            width: scale(20),
                            height: scale(20),
                        }} />} />
                </View>

                <View style={{
                    marginTop: scale(15),
                    paddingTop: scale(15),
                    borderTopColor: colors.palette.gray200,
                    borderTopWidth: scale(0.5)
                }}>
                    <ActionItem onPress={() => {
                        confirmModalRef.current?.open({
                            title: t('chat.btn_message_delete'),
                            desc: t('chat.btn_message_delete_desc'),
                            onSubmit: () => {
                                messageSenderService.clearMineMessage([chat?.id ?? ""]).then(() => {
                                    const event: ClearChatMessageEvent = { chatId: chat?.id ?? '', type: IModel.IClient.SocketTypeEnum.CLEAR_ALL_MESSAGE }
                                    const eventKey = EventManager.generateChatTopic(chat?.id ?? '')
                                    EventManager.emit(eventKey, event)
                                    toast(t('chat.success_cleaned'))
                                })
                            }
                        })
                    }} title={t('chat.btn_message_delete')} textColor="#FB3737"
                        leftComponent={
                            <Image source={require('assets/icons/close.svg')} style={{
                                width: scale(20),
                                height: scale(20),
                                marginRight: scale(8)
                            }} />
                        }
                        rightComponent={<Image source={require('assets/icons/arrow-right-gray.svg')} style={{
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
