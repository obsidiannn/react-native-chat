
import { useRef, useState } from "react";
import PagerView from "react-native-pager-view";
import { StyleSheet, View } from "react-native";
import ChatView from "./Chats";
import FriendView from "./Friends";
import GroupView from "./GroupChats";
import { colors } from "../../theme/colors";
import { Button } from "app/components";
import { scale } from "app/utils/size";
import { useTranslation } from "react-i18next";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { ColorsState } from "app/stores/system";
import { StackScreenProps } from "@react-navigation/stack";
import chatService from "app/services/chat.service";
import { App } from "types/app";
import { ChatsStore } from "app/stores/auth";
import friendService from "app/services/friend.service";
import { IUser } from "drizzle/schema";
import { GroupSingleItem } from "@repo/types";
import groupService from "app/services/group.service";

type Props = StackScreenProps<App.StackParamList, 'ChatScreen'>;
export const ChatScreen = ({ navigation }: Props) => {
    const pagerViewRef = useRef<PagerView>(null);
    const [pageIndex, setPageIndex] = useState(0);
    const themeColor = useRecoilValue(ColorsState)
    const setChatsStore = useSetRecoilState(ChatsStore)
    const [friends, setFriends] = useState<IUser[]>([])
    const [groups, setGroups] = useState<GroupSingleItem[]>([])
    const { t } = useTranslation('screens')

    const changeTab = (idx: number) => {
        pagerViewRef.current?.setPage(idx);
        if (idx === 0) {
            chatService.mineChatList().then(res => {
                setChatsStore(res)
            })
        }
        if (idx === 1) {
            groupService.getMineList().then(res => {
                setGroups(res)
            })
        }
        if (idx === 2) {
            friendService.getOnlineList().then((val) => {
                setFriends(val)
            })
        }
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
        if (pageIndex === idx) {
            return {
                backgroundColor: themeColor.btnChoosed,
                color: colors.palette.primary,
                borderColor: colors.palette.gray200,
            }
        } else {
            return {
                backgroundColor: themeColor.btnDefault,
                color: colors.palette.primary,
                borderColor: colors.palette.gray200,
            }
        }
    }

    return <View style={[styles.container, {
        backgroundColor: themeColor.background
    }]}>
        {/* <BannerComponent label="邀请好友" describe="分享一个链接" onPress={() => {

        }} /> */}

        <View style={styles.topContainer} >
            <Button label={t('chat.btn_recent')} onPress={() => changeTab(0)} containerStyle={btnStyle(0)}
                // style={[styles.tabButton]}
                textStyle={btnTextStyle(0)}
            />
            <Button label={t('chat.btn_group')} onPress={() => changeTab(1)} containerStyle={btnStyle(1)}
                // style={[styles.tabButton, btnStyle(1)]}
                textStyle={btnTextStyle(1)}
            />
            <Button label={t('chat.btn_contract')} onPress={() => changeTab(2)} containerStyle={btnStyle(2)}
                // style={[styles.tabButton, btnStyle(2)]}
                textStyle={btnTextStyle(2)}
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
            <GroupView groups={groups} />
            <FriendView contacts={friends} />
        </PagerView>
    </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        paddingHorizontal: scale(18),
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
        borderRadius: scale(12),
        borderWidth: 0
    },

    btnTextDefault: {
        fontSize: scale(14),
        fontWeight: 400,
    },
})  