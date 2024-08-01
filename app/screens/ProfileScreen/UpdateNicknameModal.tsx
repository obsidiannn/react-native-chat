import { Button } from "app/components";
import { Icon } from "app/components/Icon/Icon";
import { ScreenModal, ScreenModalType } from "app/components/ScreenModal";
import { AuthService } from "app/services/auth.service";
import { ColorsState, ThemeState } from "app/stores/system"
import { scale } from "app/utils/size";
import { forwardRef, useImperativeHandle, useRef, useState } from "react"
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View, TextInput } from "react-native"
import { useRecoilValue } from "recoil";


export interface UpdateNickNameModalRef {
    open: (
        param: {
            value: string,
            callback: (value: string) => void
        }
    ) => void;

}
export const UpdateNickNameModal = forwardRef((_, ref) => {
    const maxLength = 150
    const { t } = useTranslation('screens')
    const [loading, setLoading] = useState<boolean>(false)
    const onFinishRef = useRef<(v: string) => void>()
    const screenModalRef = useRef<ScreenModalType>(null);
    const themeColor = useRecoilValue(ColorsState)
    const $theme = useRecoilValue(ThemeState)
    const [val, setVal] = useState('')
    const onClose = () => {
        setVal('')
        setLoading(false)
        screenModalRef.current?.close()
    }

    useImperativeHandle(ref, () => ({
        open: (param: {
            value: string,
            callback: (value: string) => void
        }) => {
            console.log('open');

            setVal(param.value)
            screenModalRef.current?.open()
            onFinishRef.current = param.callback
        },
    }));

    return <ScreenModal ref={screenModalRef} title="更新昵称" >
        <>
            <View style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: scale(14)
            }}>
                <Text style={{
                    color: themeColor.title,
                    fontSize: scale(28),
                    fontWeight: '500',
                    alignSelf: 'flex-start'
                }}>
                    {t('profile.title_nickname')}
                </Text>
                <View style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: scale(22)
                }}>
                    <TextInput
                    // placeholder={t('profile.placeholder_nickname')}
                    // //placeholderTextColor={themeColor.border}
                    // maxLength={maxLength}

                    // style={{
                    //     fontSize: scale(16),
                    //     height: scale(44),
                    //     color: themeColor.text,
                    //     backgroundColor: themeColor.background,
                    //     width: '100%',
                    //     borderRadius: scale(12),
                    // }}
                    // onChangeText={(v) => setVal(v)}
                    // value={val}
                    />
                    <Text style={{
                        color: themeColor.border,
                        alignSelf: 'flex-end',
                        fontSize: scale(12),
                        marginVertical: scale(8),
                        marginRight: scale(4)
                    }}>
                        {val.length}/{maxLength}
                    </Text>

                </View>

                <View style={{
                    marginTop: scale(32),
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    padding: scale(12),
                }}>
                    <View style={{ alignItems: 'center', padding: scale(4) }}>
                        <Icon name={$theme === 'dark'?'pointDark':'pointLight'} />

                    </View>
                    <Text style={{
                        ...styles.paragraph,
                        color: themeColor.secondaryText
                    }}>
                        {t('profile.paragraph_nickname_1')}
                    </Text>

                </View>

                <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    padding: scale(12)
                }}>
                    <View style={{ alignItems: 'center', padding: scale(4) }}>
                        <Icon name={$theme === 'dark'?'pointDark':'pointLight'} />
                    </View>
                    <Text style={{
                        ...styles.paragraph,
                        color: themeColor.secondaryText
                    }}>
                        {t('profile.paragraph_nickname_2')}
                    </Text>

                </View>

                <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    padding: scale(12)
                }}>
                    <View style={{ alignItems: 'center', padding: scale(4) }}>
                        <Icon name={$theme === 'dark'?'pointDark':'pointLight'} />
                    </View>
                    <Text style={{
                        ...styles.paragraph,
                        color: themeColor.secondaryText
                    }}>
                        {t('profile.paragraph_nickname_3')}
                    </Text>

                </View>



            </View>


            <Button
                size="large"
                label={t('common.btn_submit')}
                textStyle={styles.nextButtonLabel}
                containerStyle={{
                    backgroundColor: themeColor.primary,
                    borderRadius: scale(12),
                    marginBottom: scale(14),
                    marginHorizontal: scale(12),
                }}
                onPress={async () => {
                    if (loading) {
                        return;
                    }
                    if (val.length > maxLength) {
                        return
                    }
                    setLoading(true);

                    await AuthService.updateNickName(val)
                        .then(() => {
                            onFinishRef.current && onFinishRef.current(val)
                        }).catch(() => { })
                        .finally(() => {
                            onClose()
                        })
                }} />
        </>
    </ScreenModal>
})


const styles = StyleSheet.create({
    paragraph: {
        fontSize: scale(14)
    },
    nextButton: {
        height: scale(50),
        width: '100%',
        marginTop: scale(64),
        borderRadius: scale(16),
    },
    nextButtonLabel: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
})
