import Navbar from "app/components/Navbar";
import { AppStackScreenProps, navigate } from "app/navigators";
import { colors } from "app/theme";
import { scale } from "app/utils/size";
import { useSafeAreaInsetsStyle } from "app/utils/useSafeAreaInsetsStyle";
import { Image } from "expo-image";
import { observer } from "mobx-react-lite";
import { FC, useEffect, useRef } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import ChatPage from "./ChatPage";

interface UserChatScreenProps extends AppStackScreenProps<"UserChatScreen"> { }

export const UserChatScreen: FC<UserChatScreenProps> = observer(function () {
    const $topContainerInsets = useSafeAreaInsetsStyle(["top"])
    return <View style={[styles.container, $topContainerInsets, {
        backgroundColor: '#ffffff'
    }]}>
        <Navbar title={"user name"}
            renderRight={() => {
                return <View style={{
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'row'
                }}>
                    <TouchableOpacity onPress={() => {
                        navigate('UserChatInfoModal')
                    }}>
                        <Image source={require('assets/icons/more.svg')} style={{
                            width: scale(32),
                            height: scale(32),
                        }} />
                    </TouchableOpacity>
                </View>
            }} />
        <ChatPage />
    </View>
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    topContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: scale(18),
        paddingLeft: 0
    },
    tabButton: {
        fontSize: scale(10),
        marginRight: scale(18),
        padding: 0,
        paddingVertical: scale(8),
        display: 'flex',
        flexDirection: 'row',
        minHeight: 0
    },
    tabDefault: {
        backgroundColor: colors.palette.gray200,
        color: colors.palette.primary,
        borderColor: colors.palette.gray200,
    },
    tabChecked: {
        backgroundColor: colors.palette.primary,
        color: colors.palette.gray200,
        borderColor: colors.palette.primary,
    },
    textDefault: {
        color: colors.palette.primary,
    },
    textChecked: {
        color: colors.palette.gray200
    },
})