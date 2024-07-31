


import { IModel } from "@repo/enums";
import { Button } from "app/components";
import Icon from "app/components/Icon";
import BaseModal from "app/components/base-modal";
import { AuthService } from "app/services/auth.service";
import { ColorsState } from "app/stores/system";
import { scale } from "app/utils/size";
import { Image } from "expo-image";
import { forwardRef, useImperativeHandle, useRef, useState } from "react"
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native"
import { useRecoilValue } from "recoil";


export interface UpdateGenderRef {
    open: (
        param: {
            value: number,
            callback: (value: number) => void
        }
    ) => void;

}

export default forwardRef((_, ref) => {
    const { t } = useTranslation('screens')



    const themeColor = useRecoilValue(ColorsState)
    const [val, setVal] = useState<number>(IModel.IUser.Gender.UNKNOWN)
    const [visible, setVisible] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const onFinishRef = useRef<(v: number) => void>()
    const onClose = () => {
        setVal(IModel.IUser.Gender.UNKNOWN)
        setLoading(false)
        setVisible(false)
    }

    useImperativeHandle(ref, () => ({
        open: (param: {
            value: number,
            callback: (value: number) => void
        }) => {
            setVal(param.value)
            setVisible(true)
            onFinishRef.current = param.callback
        },
    }));

    const renderMale = () => {
        return <TouchableOpacity style={styles.gender_choose} onPress={() => {
            genderChoose(IModel.IUser.Gender.MALE)
        }}>
            {
                val === IModel.IUser.Gender.MALE ?
                    <>
                        <Image source={require('assets/images/male.png')} style={styles.gender_image} contentFit="fill" />
                        <Icon path={require('assets/icons/checked.svg')} styles={{
                            width: scale(24), height: scale(24),
                            marginTop: scale(-12)
                        }} />
                    </> :
                    <>
                        <Image source={require('assets/images/male-default.png')} style={styles.gender_image} contentFit="fill" />
                        <View style={{ width: scale(12), height: scale(12) }}></View>
                    </>
            }
            <Text style={styles.gender_label}>{t('profile.status_gender_male')}</Text>

        </TouchableOpacity>
    }


    const renderFemale = () => {
        return <TouchableOpacity style={styles.gender_choose} onPress={() => {
            genderChoose(IModel.IUser.Gender.FEMALE)
        }}>
            {
                val === IModel.IUser.Gender.FEMALE ?
                    <>
                        <Image source={require('assets/images/female.png')} style={styles.gender_image} contentFit="fill" />
                        <Icon path={require('assets/icons/checked.svg')} styles={{
                            width: scale(24), height: scale(24),
                            marginTop: scale(-12)
                        }} />
                    </> :
                    <>
                        <Image source={require('assets/images/female-default.png')} style={styles.gender_image} contentFit="fill" />
                        <View style={{ width: scale(12), height: scale(12) }}></View>
                    </>
            }
            <Text style={styles.gender_label}>{t('profile.status_gender_female')}</Text>
        </TouchableOpacity>

    }

    const genderChoose = (chooseVal: number) => {
        setVal(chooseVal)
    }

    return <BaseModal visible={visible} onClose={onClose} title={t('profile.title_choose_gender')} styles={{
        padding: scale(12),
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
    }}>

        <View style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: scale(24),
            marginTop: scale(24)
        }}>
            {renderMale()}
            {renderFemale()}
        </View>
        <Button
            style={{
                backgroundColor: themeColor.primary,
                marginBottom: scale(14),
                borderRadius: scale(12)
            }}
            onPress={async () => {
                if (loading) {
                    return;
                }
                setLoading(true);

                await AuthService.updateGender(val)
                    .then(() => {
                        onFinishRef.current && onFinishRef.current(val)
                    }).catch(() => { })
                    .finally(() => {
                        onClose()
                    })
            }}  >
            <Text style={{
                ...styles.nextButtonLabel,
                color: themeColor.textChoosed
            }}> {t('common.btn_submit')}</Text>
        </Button>
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
        fontSize: 16,
        fontWeight: '700',
    },
    gender_label: {
        fontSize: scale(16),
        fontWeight: '700',
        marginTop: scale(8)
    },
    gender_choose: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: scale(4)
    },
    gender_image: {
        width: scale(120),
        height: scale(170)
    }
})