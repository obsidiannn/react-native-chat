
import { Button } from "app/components";
import Icon from "app/components/Icon";
import BaseModal from "app/components/base-modal";
import { AuthService } from "app/services/auth.service";
import { ColorsState } from "app/stores/system";
import { scale, verticalScale } from "app/utils/size";
import { forwardRef, useImperativeHandle, useRef, useState } from "react"
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View, TextInput } from "react-native"
import { useRecoilValue } from "recoil";

export interface UpdateSignRef {
    open: (
        param: {
            value: string,
            callback: (value: string) => void
        }
    ) => void;
}

export default forwardRef((_, ref) => {
    const maxLength = 150
    const { t } = useTranslation('screens')
    const [val, setVal] = useState('')
    const [visible, setVisible] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const onFinishRef = useRef<(v: string) => void>()
    const themeColor = useRecoilValue(ColorsState)

    const onClose = () => {
        setVal('')
        setLoading(false)
        setVisible(false)
    }

    useImperativeHandle(ref, () => ({
        open: (param: {
            value: string,
            callback: (value: string) => void
        }) => {
            setVal(param.value)
            setVisible(true)
            onFinishRef.current = param.callback
        },
    }));

    return <BaseModal visible={visible} onClose={onClose} title={t('profile.title_sign')} styles={{
        flex: 1,
        backgroundColor: themeColor.secondaryBackground,
        paddingTop: scale(24)
    }}>
        <View style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: scale(20),
            borderTopEndRadius: scale(24),
            borderTopStartRadius: scale(24),
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
                        padding: scale(15),
                        color: themeColor.text,
                        backgroundColor: themeColor.secondaryBackground,
                        width: '100%',
                        borderRadius: scale(12),
                    }}
                    onChangeText={(v) => {
                        setVal(v)
                    }}
                    value={val}
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


                <View style={{
                    marginTop: scale(24),
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    alignSelf: 'flex-start'
                }}>
                    <View style={{ alignItems: 'center', padding: scale(4) }}>
                        <Icon path={require("assets/icons/point.svg")} width={8} height={8} />
                    </View>
                    <Text style={{
                        ...styles.paragraph,
                        color: themeColor.secondaryText
                    }}>
                        {t('profile.paragraph_sign_1')}
                    </Text>

                </View>

                <View style={{
                    marginTop: scale(24),
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    alignSelf: 'flex-start'
                }}>
                    <View style={{ alignItems: 'center', padding: scale(4) }}>
                        <Icon path={require("assets/icons/point.svg")} width={8} height={8} />
                    </View>
                    <Text style={{
                        ...styles.paragraph,
                        color: themeColor.secondaryText
                    }}>
                        {t('profile.paragraph_sign_2')}
                    </Text>

                </View>

                <View style={{
                    marginTop: scale(24),
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    alignSelf: 'flex-start'
                }}>
                    <View style={{ alignItems: 'center', padding: scale(4) }}>
                        <Icon path={require("assets/icons/point.svg")} width={8} height={8} />
                    </View>
                    <Text style={{
                        ...styles.paragraph,
                        color: themeColor.secondaryText
                    }}>
                        {t('profile.paragraph_sign_3')}
                    </Text>

                </View>
            </View>

            <Button
                style={{
                    ...styles.nextButton,
                    backgroundColor: themeColor.primary,
                    marginBottom: scale(14),
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
                }} >
                <Text style={styles.nextButtonLabel}>
                    {t('common.btn_submit')}
                </Text>
            </Button>

        </View>

    </BaseModal>
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