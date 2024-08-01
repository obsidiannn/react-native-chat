import { GroupDetailItem } from "@repo/types"
import AvatarComponent from "app/components/Avatar"
import { Icon } from "app/components/Icon/Icon"
import fileService from "app/services/file.service"
import { AuthUser } from "app/stores/auth"
import { ColorsState, ThemeState } from "app/stores/system"
import { scale } from "app/utils/size"
import { ImageBackground, Platform, Pressable, StyleSheet, Text, View } from "react-native"
import { useRecoilValue } from "recoil"



export interface GroupCardProps {
    group: GroupDetailItem
    onPress: () => void
}

export const GroupCard = (props: GroupCardProps) => {
    const authUser = useRecoilValue(AuthUser)
    const themeColor = useRecoilValue(ColorsState)
    const $theme = useRecoilValue(ThemeState)

    const { group } = props
    return <Pressable onPress={props.onPress}>
        <ImageBackground
            accessibilityRole='image'
            resizeMode="cover"
            source={{ uri: fileService.getFullUrl(group?.cover ?? '') }} style={{
                ...styles.container,
                paddingTop: scale(36),
                // backgroundColor: themeColor.primary
            }}>
            <View style={{
                display: 'flex', flexDirection: 'column',
                backgroundColor: themeColor.background,
                padding: scale(14), width: '100%',
                borderTopRightRadius: scale(20), borderTopLeftRadius: scale(20)

            }}>
                <AvatarComponent
                    url={fileService.getFullUrl(authUser?.avatar ?? '')}
                    enableAvatarBorder style={{ marginTop: scale(-32) }}
                    width={64}
                    height={64}
                />
                <View style={{}}>
                    <Text style={{ ...styles.title, color: themeColor.title }}>{group?.name ?? ''}</Text>
                    <Text style={{ fontSize: scale(14), color: themeColor.secondaryText, }}>{group?.desc ?? ''}</Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name={$theme==='dark'?"peoplesDark":"peoplesLight"}/>
                    <Text>{group?.total}</Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ ...styles.tag, borderColor: themeColor.border }}>
                        <Text>标签1</Text>
                    </View>
                    <View style={{ ...styles.tag, borderColor: themeColor.border }}>
                        <Text>标签1</Text>
                    </View>
                    <View style={{ ...styles.tag, borderColor: themeColor.border }}>
                        <Text>标签1</Text>
                    </View>
                </View>
            </View>
        </ImageBackground>
    </Pressable>
}

const styles = StyleSheet.create({

    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: scale(24),
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    title: {
        fontSize: scale(18),
        fontWeight: '500',
        marginVertical: scale(8)
    },
    tag: {
        padding: scale(6),
        borderRadius: scale(18),
        borderWidth: scale(0.5),
        margin: scale(6)
    }

})

