
import { Button } from "app/components"; 
import { ScreenModal, ScreenModalType } from "app/components/ScreenModal";
import { AuthService } from "app/services/auth.service";
import { ColorsState, ThemeState } from "app/stores/system"
import { s, verticalScale } from "app/utils/size";
import { forwardRef, useImperativeHandle, useRef, useState } from "react"
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View, TextInput } from "react-native"
import { useRecoilValue } from "recoil";

export interface UpdateSignModalRef {
    open: (
        param: {
            value: string,
            callback: (value: string) => void
        }
    ) => void;
}

export const UpdateSignModal = forwardRef((_, ref) => {
    const maxLength = 150
    const { t } = useTranslation('screens')
    const [val, setVal] = useState('')
    const [loading, setLoading] = useState<boolean>(false)
    const onFinishRef = useRef<(v: string) => void>()
    const themeColor = useRecoilValue(ColorsState)
    const $theme = useRecoilValue(ThemeState)
    const screenModalRef = useRef<ScreenModalType>(null);

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
            setVal(param.value)
            screenModalRef.current?.open()
            onFinishRef.current = param.callback
        },
    }));

    return <ScreenModal ref={screenModalRef} title={t('profile.title_sign')}>
        <View style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: s(20),
            borderTopEndRadius: s(24),
            borderTopStartRadius: s(24),
            backgroundColor: themeColor.background
        }}>
            <View style={{
                flex: 1,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                <TextInput
                    numberOfLines={6}
                    textAlignVertical="top"
                    multiline

                    cursorColor={themeColor.text}
                    placeholder={t('profile.placeholder_sign')}
                    placeholderTextColor={themeColor.border}
                    maxLength={maxLength}
                    style={{
                        minHeight: verticalScale(100),
                        padding: s(15),
                        color: themeColor.text,
                        backgroundColor: themeColor.secondaryBackground,
                        width: '100%',
                        borderRadius: s(12),
                    }}
                    onChangeText={(v) => {
                        setVal(v)
                    }}
                    value={val}
                />
                <Text style={{
                    color: themeColor.border,
                    alignSelf: 'flex-end',
                    fontSize: s(12),
                    marginVertical: s(8),
                    marginRight: s(4)
                }}>
                    {val.length}/{maxLength}
                </Text>


                <View style={{
                    marginTop: s(24),
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    alignSelf: 'flex-start'
                }}>
                    
                    <Text style={{
                        ...styles.paragraph,
                        color: themeColor.secondaryText
                    }}>
                       * {t('profile.paragraph_sign_1')}
                    </Text>

                </View>

                <View style={{
                    marginTop: s(24),
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    alignSelf: 'flex-start'
                }}>
                    
                    <Text style={{
                        ...styles.paragraph,
                        color: themeColor.secondaryText
                    }}>
                       * {t('profile.paragraph_sign_2')}
                    </Text>

                </View>

                <View style={{
                    marginTop: s(24),
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    alignSelf: 'flex-start'
                }}>
                    
                    <Text style={{
                        ...styles.paragraph,
                        color: themeColor.secondaryText
                    }}>
                       * {t('profile.paragraph_sign_3')}
                    </Text>

                </View>
            </View>

            <Button
                size="large"
                containerStyle={{
                    ...styles.nextButton,
                    backgroundColor: themeColor.primary,
                    marginBottom: s(14),
                }}
                onPress={async () => {
                    if (loading) {
                        return;
                    }
                    if (val.length > maxLength) {
                        return
                    }
                    setLoading(true);

                    await AuthService.updateSign(val)
                        .then(() => {
                            onFinishRef.current && onFinishRef.current(val)
                        }).catch(() => { })
                        .finally(() => {
                            onClose()
                        })
                }}
                label={t('common.btn_submit')}
                textStyle={styles.nextButtonLabel}
            >
            </Button>

        </View>
    </ScreenModal>
})


const styles = StyleSheet.create({
    paragraph: {
        fontSize: s(14)
    },
    nextButton: {
        height: s(50),
        width: '100%',
        marginTop: s(64),
        borderRadius: s(16),
    },
    nextButtonLabel: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
})
