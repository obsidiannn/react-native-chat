import { IconFont } from "app/components/IconFont/IconFont";
import { ScreenModal, ScreenModalType } from "app/components/ScreenModal";
import  i18n, { supportedLanguages } from "app/i18n";
import { ColorsState } from "app/stores/system";
import { s } from "app/utils/size";
import { forwardRef, useImperativeHandle, useRef, useState } from "react"
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native"
import { useRecoilValue } from "recoil";

export interface LangModalType {
  open: () => void,
  close: () => void
}
export const LangModal = forwardRef((props: {
  theme: 'light' | 'dark'
}, ref) => {
  const screenModalRef = useRef<ScreenModalType>(null);
  const $colors = useRecoilValue(ColorsState);
  useImperativeHandle(ref, () => ({
    open: async () => {
      console.log(i18n.language)
      setLang(i18n.language)
      screenModalRef.current?.open()
    },
    close: async () => screenModalRef.current?.close(),
  }));
  const { t } = useTranslation('default');
  const [lang, setLang] = useState('en');
  return <ScreenModal theme={props.theme} title={t('Language')} ref={screenModalRef}>
    <ScrollView style={{
      flex: 1,
    }}>
      {supportedLanguages.map(item => {
        return <TouchableOpacity onPress={() => {
          setLang(item.value)
          i18n.changeLanguage(item.value)
        }} key={item.value} style={$langListItemContainer}>
          <Text style={{
            ...$langListItemText,
            color: $colors.text
          }}>{item.label}</Text>
          {lang == item.value ? <IconFont name="checkMark" color={$colors.text} size={24} /> : null}
        </TouchableOpacity>
      })}
    </ScrollView>
  </ScreenModal>
})
const $langListItemContainer: ViewStyle = {
  width: "100%",
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: s(16),
  justifyContent: "space-between",
  paddingVertical: s(24),
}
const $langListItemText: TextStyle = {
  fontSize: s(16),
  fontWeight: "400",
}