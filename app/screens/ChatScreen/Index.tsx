
import { AppStackScreenProps } from "app/navigators";
import { FC, useEffect, useRef, useState } from "react";
import PagerView from "react-native-pager-view";
import { observer } from "mobx-react-lite"
import { StyleSheet, View, useColorScheme, Text } from "react-native";
import ChatView from "./Chats";
import FriendView from "./Friends";
import GroupView from "./GroupChats";
import theme, { $dark, $light, colors } from "../../theme/colors";
import { useSafeAreaInsetsStyle } from "app/utils/useSafeAreaInsetsStyle";
import { Button } from "app/components";
import { scale } from "app/utils/size";
import BannerComponent from "app/components/Banner";
import HomeTitle from "app/components/HomeTitle";
import { useTranslation } from "react-i18next";
import { useRecoilValue } from "recoil";
import { ColorsState } from "app/stores/system";
interface ChatScreenProps extends AppStackScreenProps<"ChatScreen"> { }

export const ChatScreen: FC<ChatScreenProps> = observer(function () {
    const $topContainerInsets = useSafeAreaInsetsStyle(["top"])
    const pagerViewRef = useRef<PagerView>(null);
    const [pageIndex, setPageIndex] = useState(0);
    const { t } = useTranslation('screens')
    const themeColor = useRecoilValue(ColorsState)
    console.log('theme=', themeColor);

    const changeTab = (idx: number) => {
        pagerViewRef.current?.setPage(idx);
    }


    const btnTextStyle = (idx: number) => {
        const choosed = pageIndex === idx
        return {
            ...styles.btnTextDefault,
            ...(choosed ? {
                color: themeColor.textChoosed
            } : {
                color: themeColor.text
            })
        }
    }
    const btnStyle = (idx: number) => {
        // return pageIndex === idx ? styles.tabChecked : styles.tabDefault

        if (pageIndex === idx) {
            return {
                backgroundColor: themeColor.background,
                color: colors.palette.primary,
                borderColor: colors.palette.gray200,
            }
        } else {
            return {
                backgroundColor: colors.palette.gray200,
                color: colors.palette.primary,
                borderColor: colors.palette.gray200,
            }
        }
    }

    return <View style={[styles.container, $topContainerInsets, {
        backgroundColor: themeColor.background
    }]}>
        <HomeTitle title="信息" />
        <BannerComponent label="邀请好友" describe="分享一个链接" onPress={() => { }} />

        <View style={styles.topContainer}>
            <Button children={t('chat.btn_recent')} onPress={() => changeTab(0)}
                style={[styles.tabButton, btnStyle(0)]}
                textStyle={[btnTextStyle(0)]}
            />
            <Button children={t('chat.btn_group')} onPress={() => changeTab(1)}
                style={[styles.tabButton, btnStyle(1)]}
                textStyle={[btnTextStyle(1)]}
            />
            <Button children={t('chat.btn_contract')} onPress={() => changeTab(2)}
                style={[styles.tabButton, btnStyle(2)]}
                textStyle={[btnTextStyle(2)]}
            />
        </View>

        <PagerView ref={pagerViewRef}
            scrollEnabled={false}
            style={{
                flex: 1,
                backgroundColor: '#ffffff'
            }} onPageSelected={(v) => {
                console.log('change page');
                setPageIndex(v.nativeEvent.position);
            }} initialPage={pageIndex}>
            <ChatView />
            <GroupView />
            <FriendView />
        </PagerView>
    </View>
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: scale(18),
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
        minHeight: 0,
        borderRadius: scale(12)
    },


    btnTextDefault: {
        fontSize: scale(14),
        fontWeight: 400
    },
})