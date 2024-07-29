import { s } from "app/utils/size";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";
export interface ConfirmModalOption {
    title: string;
    desc: string;
    onSubmit?: () => void;
    onCancel?: () => void;
}
export interface ConfirmModalType {
    open: (option: ConfirmModalOption) => void;
}
export default forwardRef((_, ref) => {
    const [visible, setVisible] = useState(false);
    const { t } = useTranslation('components')
    const [option, setOption] = useState<ConfirmModalOption>({
        title: '',
        desc: '',
    });
    useImperativeHandle(ref, () => ({
        open: async (v: ConfirmModalOption) => {
            setOption(v);
            setVisible(true);
        }
    }));
    return <Modal animationType="fade" transparent={true} visible={visible} style={$modal}>
        <View style={$container}>
            <View style={$card}>
                <Text style={$title}>{option.title}</Text>
                <Text style={$desc}>{option.desc}</Text>
                <TouchableOpacity onPress={() => {
                    setVisible(false)
                    option.onSubmit && option.onSubmit()
                }} style={$submitButton}>
                    <Text style={$submitButtonText}>{t('confirm.btn_submit')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    setVisible(false)
                    option.onCancel && option.onCancel()
                }} style={$cancelButton}>
                    <Text style={$cancelButtonText}>{t('confirm.btn_cancel')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
});

const $modal: ViewStyle = {
    flex: 1,
}

const $container:ViewStyle = {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: s(15),
    flexDirection: 'row',
}
const $card: ViewStyle = {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: s(34),
    paddingBottom: s(13),
    borderRadius: s(15),
}
const $title: TextStyle = {
    fontSize: s(16),
    fontWeight: '500',
    textAlign: 'center',
}
const $desc: TextStyle = {
    color: '#999999',
    fontSize: s(14),
    fontWeight: '400',
    textAlign: 'center',
    marginTop: s(9),
    marginBottom: s(24),
    paddingHorizontal: s(15),
}
const $submitButton: ViewStyle = {
    borderTopColor: '#F4F4F4',
    borderTopWidth: s(1),
    height: s(64),
    alignItems: 'center',
    justifyContent: 'center',
}
const $submitButtonText: TextStyle = {
    color: '#D90000',
    fontSize: s(16),
    fontWeight: '500',
}
const $cancelButton: ViewStyle = {
    borderTopColor: '#F4F4F4',
    borderTopWidth: s(1),
    height: s(64),
    alignItems: 'center',
    justifyContent: 'center',
}
const $cancelButtonText: TextStyle = {
    fontSize: s(16),
    fontWeight: '500',
}