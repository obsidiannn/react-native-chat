import { IconFont } from "app/components/IconFont/IconFont";
import { ScreenModal, ScreenModalType } from "app/components/ScreenModal";
import { ColorsState, ThemeState } from "app/stores/system";
import { s } from "app/utils/size";
import { forwardRef, useImperativeHandle, useRef, useState } from "react"
import { ScrollView, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRecoilValue } from "recoil";
export interface LangModalType {
  open: () => void,
  close: () => void
}
export const LangModal = forwardRef((_, ref) => {
  const screenModalRef = useRef<ScreenModalType>(null);
  const insets = useSafeAreaInsets();
  const $colors = useRecoilValue(ColorsState);
  const $theme = useRecoilValue(ThemeState);
  useImperativeHandle(ref, () => ({
    open: async () => screenModalRef.current?.open(),
    close: async () => screenModalRef.current?.close(),
  }));
  const [lang, setLang] = useState('en');
  const languages: {
    name: string,
    value: string,
  }[] = [
      {
        name: "English",
        value: "en"
      },
      {
        name: "简体中文",
        value: "zh"
      },
      {
        name: "繁體中文",
        value: "zh-hant"
      },
      {
        name: "日本語",
        value: "ja"
      },
      {
        name: "한국어",
        value: "ko"
      },
      {
        name: "Português",
        value: "pt"
      },
      {
        name: "Español",
        value: "es"
      },
    ]
  return <ScreenModal ref={screenModalRef}>
    <View style={[
      {
        backgroundColor: $colors.background,
        paddingBottom: insets.bottom,
      },
      $container
    ]}>
      <ScrollView style={{
        flex: 1,
      }}>
        {languages.map(item => {
          return <TouchableOpacity onPress={() => setLang(item.value)} key={item.value} style={$langListItemContainer}>
            <Text style={{
              ...$langListItemText,
              color: $colors.text
            }}>{item.name}</Text>
            {lang == item.value ? <IconFont name="checkMark" color={$colors.text} size={24} /> : null}
          </TouchableOpacity>
        })}
      </ScrollView>
    </View>
  </ScreenModal>
})
const $container: ViewStyle = {
  marginTop: s(20),
  flex: 1,
  borderTopEndRadius: s(20),
  borderTopStartRadius: s(20),
  paddingTop: s(10)
}
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