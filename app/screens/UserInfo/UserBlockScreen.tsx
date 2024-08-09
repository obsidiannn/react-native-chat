import { StackScreenProps } from "@react-navigation/stack";
import { FlashList } from "@shopify/flash-list";
import ContractListItem from "app/components/ContractListItem";
import Navbar from "app/components/Navbar";
import fileService from "app/services/file.service";
import friendService from "app/services/friend.service";
import { s } from "app/utils/size";
import { IUser } from "drizzle/schema";
import { useCallback, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { App } from "types/app";
import UserBlockModal, { UserBlockModalType } from "./UserBlockModal";

type Props = StackScreenProps<App.StackParamList, 'UserBlockScreen'>;

export const UserBlockScreen = (props: Props) => {
    const insets = useSafeAreaInsets();

    const [users, setUsers] = useState<IUser[]>([])
    const userBlockModalRef = useRef<UserBlockModalType>(null)
    const loadData = useCallback(async () => {
        const list = await friendService.getBlockedList()
        console.log('block users ',list);
        
        setUsers(list)
    }, [])

    return <View style={{
        ...styles.container,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
    }}>
        <Navbar title={'黑名单'} />
        <FlashList
            // ref={listRef}
            onEndReached={loadData}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => "friend" + item.id.toString()}
            estimatedItemSize={s(76)}
            data={users}
            contentContainerStyle={{
                paddingHorizontal: s(8)
            }}
            renderItem={({ item, index }) => {
                return <ContractListItem
                    onPress={async () => {
                        userBlockModalRef.current?.open(item)
                    }}
                    icon={fileService.getFullUrl(item.avatar ?? '')}
                    title={item?.friendAlias ?? item.nickName ?? item.userName}
                    secondTitle={item.sign ?? ''}
                    bottomLine={users.length > 1 && index < users.length - 1} />;
            }}
        />
        <UserBlockModal ref={userBlockModalRef} />
    </View>
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
});
