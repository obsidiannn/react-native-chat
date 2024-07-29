import colors from "@/config/colors";
import { defaultLng, supportedLanguages } from "@/locales/i18n";
import BaseModal from "@/modals/base-modal";
import { Image } from "expo-image";
import i18next from "i18next";
import { forwardRef, useImperativeHandle, useRef, useState } from "react"
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native"
import { scale } from "react-native-size-matters/extend";
import { Button } from "react-native-ui-lib";
import dayjs from 'dayjs'
import contextUtil from "@/helpers/context";
export interface UpdateLanguageRef {
    open: (
        param: {
            value: string,
            callback: (value: string) => void
        }
    ) => void;
}

export interface UpdateGenderRef {
    open: (
        param: {
            value: number,
            callback: (value: number) => void
        }
    ) => void;

}

export default forwardRef((_, ref) => {
    const { t } = useTranslation('screen-user-profile')
    const renderChecked = () => {
        return <Image source={require('@/assets/icons/checked.svg')}
            style={{ width: scale(14), height: scale(14) }}

        />
    }

    const [val, setVal] = useState<string>(defaultLng)
    const [visible, setVisible] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const onFinishRef = useRef<(v: string) => void>()
    const onClose = () => {
        setVal(defaultLng)
        setLoading(false)
        setVisible(false)
    }

    useImperativeHandle(ref, () => ({
        open: (param: {
            value: string,
            callback: (value: string) => void
        }) => {
            console.log('open', param.value);

            setVal(param.value)
            setVisible(true)
            onFinishRef.current = param.callback
        },
    }));

    return <BaseModal visible={visible} onClose={onClose} title={t('input_language')}>


        <View style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingHorizontal: scale(16)
        }}>
            {
                supportedLanguages().map((g, i) => {
                    const isLast = i === (supportedLanguages().length - 1)
                    return <TouchableOpacity
                        key={g.value}
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: scale(12),
                            paddingVertical: scale(20),
                            width: '100%',
                            justifyContent: 'space-between',
                            ...(!isLast ? {
                                borderBottomColor: colors.gray200,
                                borderBottomWidth: scale(0.5)
                            } : {})
                        }}
                        onPress={() => {
                            console.log('checked');

                            setVal(g.value)
                        }}>
                        <View>
                            <Text
                                style={{
                                    color: colors.gray950,
                                    fontSize: scale(16)
                                }}
                            >
                                {g.label}
                            </Text>
                            <Text style={{
                                marginTop: scale(4),
                                color: colors.gray400,
                                fontSize: scale(14)
                            }}>
                                {g.labelDesc}
                            </Text>
                        </View>
                        {g.value === val ? renderChecked() : null}
                    </TouchableOpacity>
                })
            }

            <Button size="large"
                style={styles.nextButton}
                backgroundColor={colors.primary} onPress={async () => {
                    if (loading) {
                        return;
                    }
                    setLoading(true);
                    i18next.changeLanguage(val)
                    contextUtil.setLocalLanguage(val)
                    onFinishRef.current?.(val)
                    setLoading(false)
                    onClose()

                }} label={t('btn_submit')} labelStyle={styles.nextButtonLabel} />
        </View>

    </BaseModal>
})


const styles = StyleSheet.create({
    paragraph: {
        color: colors.gray400,
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