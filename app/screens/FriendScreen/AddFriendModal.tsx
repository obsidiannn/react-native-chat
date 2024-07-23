import { IServer } from "@repo/types"
import FriendItem from "app/components/FriendItem"
import Navbar from "app/components/Navbar"
import fileService from "app/services/file.service"
import friendService from "app/services/friend.service"
import userService from "app/services/user.service"
import { ColorsState } from "app/stores/system"
import { scale } from "app/utils/size"
import { Image } from "expo-image"
import { useCallback, useState } from "react"
import { View, TouchableOpacity, StyleSheet, TextInput, Pressable, ScrollView } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRecoilValue } from "recoil"

export const AddFriendModal = () => {
    const themeColor = useRecoilValue(ColorsState)
    const [keyword, setKeyword] = useState('')
    const [loading, setLoading] = useState(false);
    const [friends, setFriends] = useState<IServer.IFriend[]>([]);

    const search = useCallback(async (v: string, l: boolean) => {
        if (!v) {
            return;
        }
        if (loading) {
            return;
        }
        setLoading(true);
        const user = await userService.findByUserName(v);
        console.log('user', user);

        if (user) {
            const userRelations = await friendService.getReleationList([user.id])
            console.log('userRelations', userRelations);

            if (userRelations.items) {
                const userRelation = userRelations.items.find(item => item.userId == user.id);
                console.log('userRelation', userRelation);
                if (userRelation) {
                    setFriends([
                        {
                            id: user.id,
                            avatar: fileService.getFullUrl(user.avatar ?? ''),
                            friendId: 0,
                            remark: user.nickName ?? '',
                            remarkIdx: user.nickNameIdx ?? '',
                            relation: 1,
                            relationStatus: userRelation.status,
                            chatId: '',
                            addr: user.addr ?? '',
                            updateAt: user.updatedAt?.valueOf() ?? 0,
                        }
                    ])
                }
            }

        }
        return () => {
            setLoading(false)
        }
    }, [])
    const insets = useSafeAreaInsets();
    return <View style={{
        flex: 1,
        paddingTop: insets.top
    }}>
        <Navbar title="添加好友"/>
        <View style={{
            ...styles.mainContainer,
            backgroundColor: themeColor.background
        }}>
            <View style={{
                ...styles.queryView,
                backgroundColor: themeColor.secondaryBackground,
            }}>
                <TextInput
                    underlineColorAndroid='transparent'
                    style={{
                        ...styles.input,
                        color: themeColor.text
                    }}
                    onSubmitEditing={() => {
                        if (!keyword) {
                            return;
                        }
                        search(keyword, true)
                    }}
                    returnKeyLabel="搜索"
                    returnKeyType="search"
                    onChangeText={(v) => {
                        setKeyword(v)
                    }}
                    cursorColor={themeColor.text}
                    value={keyword}
                />
                <Pressable style={{
                  
                }} onPress={() => {
                    console.log('search');
                    search(keyword, false)
                }}>
                    <Image source={require('assets/icons/query-search.svg')} style={{
                        width: scale(20),
                        height: scale(20),
                    }} />
                </Pressable>
            </View>

            <ScrollView style={styles.contentContainer}>
                {friends.map((item, i) => <FriendItem isLast={i == (friends.length - 1)} item={item} key={item.id} />)}
            </ScrollView>
        </View>
    </View>
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        padding: scale(14),
        paddingTop: scale(24),
        display: 'flex',
        marginTop: scale(24),
        borderTopLeftRadius: scale(32),
        borderTopRightRadius: scale(32)
    },
  
    queryView: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: scale(32),
        paddingVertical: scale(14),
        paddingRight: scale(24),
        paddingLeft: scale(14),
    },
    input: {
        width: '85%',
        fontSize: 16,
        fontWeight: '500',
        marginRight: scale(4),
        paddingLeft: scale(12)
    },
    contentContainer: {
        flex: 1,
        paddingTop: scale(15),
    },
})