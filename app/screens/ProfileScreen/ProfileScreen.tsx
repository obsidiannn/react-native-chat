import AvatarUpload from "app/components/AvatarUpload";
import { AuthUser } from "app/stores/auth";
import { ColorsState, ThemeState } from "app/stores/system";
import { s } from "app/utils/size";
import { useTranslation } from "react-i18next";
import { useRecoilState, useRecoilValue } from "recoil";
import UpdateNickname, { UpdateNicknameRef } from "./UpdateNicknameModal";
import UpdateGender, { UpdateGenderRef } from "./UpdateGenderModal";
import UpdateSign, { UpdateSignRef } from "./UpdateSignModal";
import UpdateUsername, { UpdateUsernameModalRef } from "./UpdateUsernameModal";
import toast from "app/utils/toast";
import { IModel } from "@repo/enums";
import { AuthService } from "app/services/auth.service";
import fileService from "app/services/file.service";
import { IUser } from "drizzle/schema";
import { LocalUserService } from "app/services/LocalUserService";

import { useRef } from "react"
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Navbar from "app/components/Navbar";
import { CardMenu } from "app/components/CardMenu/CardMenu";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "app/components/Icon/Icon";

import AssetIcon from "app/components/Icon";
import profile from "app/utils/profile";
import strUtil from "app/utils/str-util";
export const ProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const $colors = useRecoilValue(ColorsState);
    const $theme = useRecoilValue(ThemeState);
    const updateNicknameModalRef = useRef<UpdateNicknameRef>(null)
    const updateGenderModalRef = useRef<UpdateGenderRef>(null)
    const updateSignModalRef = useRef<UpdateSignRef>(null)
    const updateUsernameModalRef = useRef<UpdateUsernameModalRef>(null)
    const [authUser, setAuthUser] = useRecoilState(AuthUser)
    const { t } = useTranslation('screens');
    const authUpdate = (user: IUser) => {
        void LocalUserService.deleteByIdIn([user?.id ?? 0])
        setAuthUser(user)
    }

    return <View style={{
        flex: 1,
        paddingTop: insets.top,
        backgroundColor: $colors.secondaryBackground,
    }}>
        <Navbar />
        <Text style={{
            color: $colors.text,
            fontSize: s(26),
            fontWeight: "600",
            marginTop: s(10),
            marginLeft: s(10),
            marginVertical: s(30)
        }}>{t('profile.title_user_profile')}</Text>
        <View style={{
            width: s(343),
            padding: s(16),
        }}>
            <AvatarUpload avatar={fileService.getFullUrl(authUser?.avatar ?? '')} border onChange={(val: string) => {
                AuthService.updateAvatar(val).then((res) => {
                    if (res) {
                        authUpdate({
                            ...authUser,
                            avatar: res
                        })
                        toast(t('common.success_updated'));
                    } else {
                        toast(t('common.failed_updated'));
                    }
                })
            }} />
        </View>
        <View style={{
            flex: 1,
            backgroundColor: "white",
            width: s(375),
            borderTopRightRadius: s(32),
            borderTopLeftRadius: s(32),
            paddingHorizontal: s(15),
            paddingTop: s(30)
        }}>
            <CardMenu items={[
                {
                    icon: <Icon name={$theme == "dark" ? "editDark" : "editLight"} />,
                    title: t('profile.title_nickname'),
                    onPress: () => {
                        updateNicknameModalRef.current?.open({
                            value: authUser?.nickName ?? '',
                            callback: (val: string) => {
                                authUpdate({
                                    ...authUser,
                                    nickName: val
                                })
                                toast(t('common.success_updated'));
                            }
                        })
                    },
                    rightArrow: <View style={styles.formLine} >
                        <Text style={{ color: $colors.secondaryText }}>{authUser?.nickName}</Text>
                        <Icon name="arrowRight" />
                    </View>,
                    theme: $theme,
                },
                {
                    icon: <Icon name={$theme == "dark" ? "editDark" : "editLight"} />,
                    title: t('profile.title_username'),
                    onPress: () => {
                        updateUsernameModalRef.current?.open({
                            value: authUser?.userName ?? '',
                            callback: (val: string) => {
                                authUpdate({
                                    ...authUser,
                                    userName: val
                                })
                                toast(t('success_updated'));
                            }
                        })
                    },
                    theme: $theme,
                    rightArrow: <View style={styles.formLine} >
                        <Text style={{ color: $colors.secondaryText }}>{strUtil.truncateMiddle(authUser?.userName ?? '', 20)}</Text>
                        <Icon name="arrowRight" />
                    </View>

                },
                {
                    icon: <Icon name={$theme == "dark" ? "genderDark" : "genderLight"} />,
                    title: t('profile.title_gender'),
                    onPress: () => {
                        updateGenderModalRef.current?.open({
                            value: authUser?.gender ?? IModel.IUser.Gender.UNKNOWN,
                            callback: (val: number) => {
                                authUpdate({
                                    ...authUser,
                                    gender: val
                                })
                                toast(t('common.success_updated'));
                            }
                        })
                    },
                    theme: $theme,
                    rightArrow: <View style={styles.formLine} >
                        <Text style={{ color: $colors.secondaryText }}>{profile.genderValue(authUser?.gender)}</Text>
                        <Icon name="arrowRight" />
                    </View>
                },
                {
                    icon: <Icon name={$theme == "dark" ? "signDark" : "signLight"} />,
                    title: t('profile.title_sign'),
                    onPress: () => {
                        updateSignModalRef.current?.open({
                            value: authUser?.sign ?? '',
                            callback: (val: string) => {
                                authUpdate({
                                    ...authUser,
                                    sign: val
                                })
                                toast(t('common.success_updated'));
                            }
                        })
                    },
                    theme: $theme,
                    rightArrow: <View style={styles.formLine} >
                        <Text style={{ color: $colors.secondaryText }}>{strUtil.truncateMiddle(authUser?.sign ?? '', 20) ?? t('common.default_label_none')}</Text>
                        <Icon name="arrowRight" />
                    </View>
                },
            ]} />
        </View>
        <UpdateNickname ref={updateNicknameModalRef} />
        <UpdateGender ref={updateGenderModalRef} />
        <UpdateSign ref={updateSignModalRef} />
        <UpdateUsername ref={updateUsernameModalRef} />
    </View>
}

const styles = StyleSheet.create({
    formLine: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    }
})
