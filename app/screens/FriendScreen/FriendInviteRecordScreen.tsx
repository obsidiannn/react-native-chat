import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import Navbar from "app/components/Navbar";
import InviteItem from "./InviteItem";
import userService from "app/services/user.service";
import friendApplyService from "app/services/friend-apply.service";
import { IServer } from "@repo/types";
import { IUser } from "drizzle/schema";
import { useTranslation } from 'react-i18next';
import { App } from "types/app";
import { useRecoilValue } from "recoil";
import { AuthUser } from "app/stores/auth";
import { scale } from "app/utils/size";
import { navigate } from "app/navigators";


type Props = StackScreenProps<App.StackParamList, 'FriendInviteRecordScreen'>;
export const FriendInviteRecordScreen = ({ navigation }: Props) => {
    const insets = useSafeAreaInsets();
    const [items, setItems] = useState<{
        friendApply: IServer.IFriendApply,
        user: IUser | undefined
    }[]>([]);

    const currentUser = useRecoilValue(AuthUser)
    const { t } = useTranslation('screens')
    const [loading, setLoading] = useState<boolean>(true)
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            if (currentUser) {
                const friendApplys = await friendApplyService.getList()
                console.log("friendApplys:", friendApplys);
                const userIds = friendApplys.map(f => {
                    return f.userId == currentUser.id ? f.friendId : f.userId
                });
                const tmps = await userService.findByIds(userIds);
                setItems(friendApplys.map(f => {
                    let user: IUser | undefined;
                    if (currentUser.id == f.userId) {
                        user = tmps.find(u => u.id == f.friendId)
                    } else {
                        user = tmps.find(u => u.id == f.userId)
                    }
                    return {
                        friendApply: f,
                        user
                    }
                }));
                setLoading(false)
            }
        });
        return unsubscribe;
    }, [navigation])


    const renderFooter = () => {
        if (loading) {
            return <ActivityIndicator />
        }
        return null
    }

    const renderNavbarRight = () => {
        return <View style={styles.rightContainer}>
            <TouchableOpacity onPress={() => {
                // navigation.navigate('AddFriendModal');
                navigate('AddFriendModal')
            }}>
                <Text style={styles.text}>{t('friend.add_friend_title')}</Text>
            </TouchableOpacity>
        </View>
    }

    return (
        <View style={{
            ...styles.container,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
        }}>
            <View>
                <Navbar renderRight={() => renderNavbarRight()} title={t('friend.title_new_friend')} />
            </View>
            <View style={styles.listContainer}>
                <FlashList
                    data={items}
                    ListFooterComponent={renderFooter}
                    renderItem={({ item, index }) => {
                        console.log("renderItem", item.user)
                        if (!item.user) {
                            return null
                        }
                        return <InviteItem user={item.user} item={item.friendApply} isLast={index === items.length - 1} />
                    }}
                    estimatedItemSize={scale(76)}
                >
                </FlashList>
            </View>
        </View>
    );
}; 

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    listContainer: {
        flex: 1,
        width: '100%'
    },
    rightContainer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 15,
        fontWeight: '400',
        color: '#000000'
    }
})