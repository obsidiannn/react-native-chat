
import { AppStackScreenProps } from "app/navigators";
import { FC, useRef, useState } from "react";
import PagerView from "react-native-pager-view";
import { observer } from "mobx-react-lite"
import { StyleSheet, View, useColorScheme } from "react-native";
import ChatView from "./Chats";
import FriendView from "./Friends";
import GroupView from "./GroupChats";
import theme, { colors } from "../../theme/colors";
import { useSafeAreaInsetsStyle } from "app/utils/useSafeAreaInsetsStyle";
import { Button } from "app/components";
import { scale } from "app/utils/size";
import BannerComponent from "app/components/Banner";
import HomeTitle from "app/components/HomeTitle";
interface ChatScreenProps extends AppStackScreenProps<"ChatScreen"> { }

export const ChatScreen: FC<ChatScreenProps> = observer(function () {
    const $topContainerInsets = useSafeAreaInsetsStyle(["top"])
    const colorScheme = useColorScheme();
    const $colors = colorScheme !== "dark" ? theme.$dark : theme.$light
    const pagerViewRef = useRef<PagerView>(null);
    const [pageIndex, setPageIndex] = useState(0);

    const changeTab = (idx: number) => {
        pagerViewRef.current?.setPage(idx);
    }

    const btnTextStyle = (idx: number) => {
        return pageIndex === idx ? styles.textChecked : styles.textDefault
    }
    const btnStyle = (idx: number) => {
        return pageIndex === idx ? styles.tabChecked : styles.tabDefault
    }

    return <View style={[styles.container, $topContainerInsets, {
        backgroundColor: '#ffffff'
    }]}>

        <HomeTitle title="信息" />
        <BannerComponent label="邀请好友" describe="分享一个链接" onPress={() => { }} />

        <View style={styles.topContainer}>
            <Button text="最近" onPress={() => changeTab(0)}
                style={[styles.tabButton, btnStyle(0)]}
                textStyle={[btnTextStyle(0)]}
            />
            <Button text="群组" onPress={() => changeTab(1)}
                style={[styles.tabButton, btnStyle(1)]}
                textStyle={[btnTextStyle(1)]}
            />
            <Button text="联系人" onPress={() => changeTab(2)}
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