import AvatarX from "app/AvatarX";
import AvatarUpload from "app/components/AvatarUpload";
import { FormLine } from "app/components/FormLine";
import Icon from "app/components/Icon";
import BaseModal from "app/components/base-modal";
import { AuthUser } from "app/stores/auth";
import { ColorsState, ThemeState } from "app/stores/system";
import { s } from "app/utils/size";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { useRecoilState, useRecoilValue } from "recoil";
import UpdateNickname, { UpdateNicknameRef } from "./update-nickname";
import UpdateGender, { UpdateGenderRef } from "./update-gender";
import UpdateSign, { UpdateSignRef } from "./update-sign";
import UpdateUsername, { UpdateUsernameModalRef } from "./update-username";
import toast from "app/utils/toast";
import { IModel } from "@repo/enums";
import profile from "app/utils/profile";
import strUtil from "app/utils/str-util";
import auth from "app/api/auth";
import { AuthService } from "app/services/auth.service";
import fileService from "app/services/file.service";
import { IUser } from "drizzle/schema";
import { LocalUserService } from "app/services/LocalUserService";


export interface ProfiModalType {
    open: () => void
}

export default forwardRef((_, ref) => {

    const [visible, setVisible] = useState(false)
    const themeColor = useRecoilValue(ColorsState)
    const [authUser, setAuthUser] = useRecoilState(AuthUser)
    const $theme = useRecoilValue(ThemeState)
    const { t } = useTranslation('screens')

    const updateNicknameModalRef = useRef<UpdateNicknameRef>(null)
    const updateGenderModalRef = useRef<UpdateGenderRef>(null)
    const updateSignModalRef = useRef<UpdateSignRef>(null)
    const updateUsernameModalRef = useRef<UpdateUsernameModalRef>(null)

    const onClose = () => {
        setVisible(false)
    }

    useImperativeHandle(ref, () => ({
        open: () => {
            setVisible(true);
        }
    }));

    const authUpdate = (user: IUser) => {
        void LocalUserService.deleteByIdIn(user.id)
        setAuthUser(user)
    }

    return <BaseModal title="" visible={visible} onClose={onClose} styles={{
        flex: 1,
        backgroundColor: themeColor.background
    }} >
        <View style={{
            padding: s(12),
            flex: 1
        }}>
            <Text style={{
                color: themeColor.text,
                fontSize: s(26),
                fontWeight: "600",
            }}>
                {t('profile.title_user_profile')}
            </Text>
            <View style={{
                flex: 1,
                backgroundColor: "white",
                borderTopRightRadius: s(32),
                borderTopLeftRadius: s(32),
                paddingTop: s(30)
            }}>
                <AvatarUpload avatar={fileService.getFullUrl(authUser.avatar ?? '')} border onChange={(val: string) => {
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
                <View style={{
                    paddingVertical: s(10),
                    borderRadius: s(16),
                    backgroundColor: themeColor.secondaryBackground,
                    marginTop: s(30)
                }}>
                    <FormLine onPress={() => {
                        updateNicknameModalRef.current?.open({
                            value: authUser.nickName ?? '',
                            callback: (val: string) => {
                                authUpdate({
                                    ...authUser,
                                    nickName: val
                                })
                                toast(t('common.success_updated'));
                            }
                        })
                    }}
                        title={t('profile.title_nickname')}
                        renderLeft={
                            <Icon color={themeColor.text} path={require('assets/icons/pencel.svg')} />
                        }
                        renderRight={
                            <View style={styles.formLine} >
                                <Text style={{ color: themeColor.secondaryText }}>{authUser.nickName}</Text>
                                <Icon color={themeColor.secondaryText} path={require('assets/icons/arrow-right-gray.svg')} />
                            </View>
                        }
                    />
                    <FormLine onPress={() => {
                        updateGenderModalRef.current?.open({
                            value: authUser.gender ?? IModel.IUser.Gender.UNKNOWN,
                            callback: (val: number) => {
                                authUpdate({
                                    ...authUser,
                                    gender: val
                                })
                                toast(t('common.success_updated'));
                            }
                        })
                    }}
                        title={t('profile.title_gender')}
                        renderLeft={
                            <Icon color={themeColor.text} path={require('assets/icons/female-default.svg')} />
                        }
                        renderRight={
                            <View style={styles.formLine} >
                                <Text style={{ color: themeColor.secondaryText }}>{profile.genderValue(authUser.gender)}</Text>
                                <Icon color={themeColor.secondaryText} path={require('assets/icons/arrow-right-gray.svg')} />
                            </View>
                        }
                    />

                    <FormLine onPress={() => {
                        updateSignModalRef.current?.open({
                            value: authUser.sign ?? '',
                            callback: (val: string) => {
                                authUpdate({
                                    ...authUser,
                                    sign: val
                                })
                                toast(t('common.success_updated'));
                            }
                        })
                    }}
                        title={t('profile.title_sign')}
                        renderLeft={
                            <Icon color={themeColor.text} path={require('assets/icons/note.svg')} />
                        }
                        renderRight={
                            <View style={styles.formLine} >
                                <Text style={{ color: themeColor.secondaryText }}>{strUtil.truncateMiddle(authUser.sign, 20) ?? t('common.default_label_none')}</Text>
                                <Icon color={themeColor.text} path={require('assets/icons/arrow-right-gray.svg')} />
                            </View>
                        }
                    />

                    <FormLine onPress={() => {
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
                    }}
                        title={t('profile.title_username')}
                        renderLeft={
                            <Icon color={themeColor.text} path={require('assets/icons/link.svg')} />
                        }
                        renderRight={
                            <View style={styles.formLine} >
                                <Text style={{ color: themeColor.secondaryText }}>{strUtil.truncateMiddle(authUser.userName, 20)}</Text>
                                <Icon color={themeColor.text} path={require('assets/icons/arrow-right-gray.svg')} />
                            </View>
                        }
                    />

                </View>
            </View>
        </View>

        <UpdateNickname ref={updateNicknameModalRef} />
        <UpdateGender ref={updateGenderModalRef} />
        <UpdateSign ref={updateSignModalRef} />
        <UpdateUsername ref={updateUsernameModalRef} />


    </BaseModal >
})

const styles = StyleSheet.create({
    formLine: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    }
})