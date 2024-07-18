import { scale, verticalScale } from "app/utils/size";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Text, TouchableOpacity, View } from "react-native";
export interface ConfirmOption {
    title: string;
    desc: string;
    onSubmit?: () => void;
    onCancel?: () => void;
}
export interface ConfirmModalType {
    open: (option: ConfirmOption) => void;
}
export default forwardRef((_, ref) => {
    const [visible, setVisible] = useState(false);
    const {t} = useTranslation()
    const [option, setOption] = useState<ConfirmOption>({
        title: '',
        desc: '',
    });
    useImperativeHandle(ref, () => ({
        open: async (v: ConfirmOption) => {
            setOption(v);
            setVisible(true);
        }
    }));
    return <Modal animationType="fade" transparent={true} visible={visible} style={{
        flex: 1,
    }}>
        <View style={{
            flex: 1,
            backgroundColor: '#00000066',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: scale(15),
            flexDirection: 'row',
        }}>
            <View style={{
                flex: 1,
                backgroundColor: 'white',
                paddingTop: verticalScale(34),
                paddingBottom: verticalScale(13),
                borderRadius: scale(15),
            }}>
                <Text style={{
                    fontSize: scale(16),
                    fontWeight: '500',
                    textAlign: 'center',
                }}>{option.title}</Text>
                <Text style={{
                    color: '#999999',
                    fontSize: scale(14),
                    fontWeight: '400',
                    textAlign: 'center',
                    marginTop: verticalScale(9),
                    marginBottom: verticalScale(24),
                    paddingHorizontal: scale(15),
                }}>{option.desc}</Text>
                <TouchableOpacity onPress={() => {
                    setVisible(false)
                    option.onSubmit && option.onSubmit()
                }} style={{
                    borderTopColor: '#F4F4F4',
                    borderTopWidth: verticalScale(1),
                    height: verticalScale(64),
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Text style={{
                        color: '#D90000',
                        fontSize: scale(16),
                        fontWeight: '500',
                    }}>{t('common.btn_submit')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    setVisible(false)
                    option.onCancel && option.onCancel()
                }} style={{
                    borderTopColor: '#F4F4F4',
                    borderTopWidth: verticalScale(1),
                    height: verticalScale(64),
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Text style={{
                        fontSize: scale(16),
                        fontWeight: '500',
                    }}>{t('common.btn_cancel')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
});
