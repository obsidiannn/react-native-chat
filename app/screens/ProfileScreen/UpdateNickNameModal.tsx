import { Button } from "app/components";
import { ScreenModal, ScreenModalType } from "app/components/ScreenModal";
import { AuthService } from "app/services/auth.service";
import { ColorsState } from "app/stores/system"
import { s } from "app/utils/size";
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
export const UpdateNickNameModal = forwardRef((props: {
    theme: 'light' | 'dark'
}, ref) => {
    const maxLength = 150
    const { t } = useTranslation('default')
    const [loading, setLoading] = useState<boolean>(false)
    const onFinishRef = useRef<(v: string) => void>()
    const screenModalRef = useRef<ScreenModalType>(null);
    const themeColor = useRecoilValue(ColorsState)
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

    return <ScreenModal theme={props.theme} ref={screenModalRef} title={t('Nickname')} style={{ flex: 1 }} >
        <View style={{
            padding: s(14),
            flex: 1,
        }}>
            <View style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                <View style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: s(22)
                }}>
                    <TextInput
                        placeholder={t('Set Nickname')}
                        //placeholderTextColor={themeColor.border}
                        maxLength={maxLength}

                        style={{
                            fontSize: s(16),
                            height: s(44),
                            color: themeColor.text,
                            backgroundColor: themeColor.background,
                            width: '100%',
                            borderRadius: s(12),
                        }}
                        onChangeText={(v) => setVal(v)}
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

                </View>


                <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    padding: s(12)
                }}>

                    <Text style={{
                        ...styles.paragraph,
                        color: themeColor.secondaryText
                    }}>
                        * 提示词
                    </Text>

                </View>



            </View>


            <Button
                size="large"
                label={t('Submit')}
                theme={props.theme}
                fullRounded
                type="primary"
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
