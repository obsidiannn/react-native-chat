import React, { useEffect, useRef, useState } from "react"
import { Image } from "expo-image"
import { ImageStyle, View, Text, Appearance, Pressable, ViewStyle, TextStyle } from "react-native";
import { s } from 'app/utils/size';
import { useRecoilValue } from "recoil"
import { ColorsState } from "app/stores/system"
import { useTranslation } from 'react-i18next';
import { getLocales } from "expo-localization";
import { Screen } from "app/components";
import { Button } from "app/components/Button";
import { StackScreenProps } from "@react-navigation/stack";
import { Checkbox } from "./Checkbox";
import { App } from "types/app";
import { ConfirmModal, ConfirmModalType } from "app/components/ConfirmModal";

type Props = StackScreenProps<App.StackParamList, 'WelcomeScreen'>;
export const WelcomeScreen = ({ navigation }: Props) => {
  const colorScheme = Appearance.getColorScheme();
  const $colors = useRecoilValue(ColorsState);
  const [protocolStatus, setProtocolStatus] = useState(false)
  const confirmModalRef = useRef<ConfirmModalType>();
  const { t } = useTranslation("screens");
  const protocols = [
    {
      name: 'agreement_privacy',
      url: 'https://pages.ducloud.buzz/#/user-agreement'
    },
    {
      name: 'agreement_user',
      url: 'https://pages.ducloud.buzz/#/privacy-policy'
    },
  ];
  useEffect(() => {
    const locales = getLocales();
    if (locales.length > 0) {
      const locale = locales[0];
      console.log(locale);
    }
  }, [])
  return (
    <Screen statusBarStyle={colorScheme == "dark" ? 'dark' : 'light'} safeAreaEdges={["top"]} preset="scroll" backgroundColor={$colors.background}>
      <Text style={[$titleText, {
        color: $colors.text
      }]}>{t('welcome.title')}</Text>
      <Image style={$bg} source={require("assets/images/welcomeBg.webp")} cachePolicy="disk" />
      <View style={[$buttonContainer, {
        marginTop: s(40)
      }]}>
        <Button onPress={() => {
          if (!protocolStatus) {
            confirmModalRef.current?.open({
              title: "确认阅读并同意相关协议",
              content: "确认阅读并同意相关协议",
              onSubmit: () => {
                navigation.navigate("UnlockScreen")
              }
            });
            return;
          }
          navigation.navigate("UnlockScreen")
        }} fullWidth size="large" label={t("welcome.signIn")} type="primary" />
      </View>
      <View style={$buttonContainer}>
        <Button onPress={() => {
          if (!protocolStatus) {
            confirmModalRef.current?.open({
              title: "确认阅读并同意相关协议",
              content: "确认阅读并同意相关协议",
              onSubmit: () => {
                navigation.navigate("SignUpScreen")
              }
            });
            return;
          }
          navigation.navigate("SignUpScreen")
        }} fullWidth label={t("welcome.signUp")} size="large" type="secondary" />
      </View>
      <View style={$checkboxContainer}>
        <Checkbox onChange={() => setProtocolStatus(!protocolStatus)} checked={protocolStatus} />
        <Pressable onPress={() => setProtocolStatus(!protocolStatus)}>
          <Text style={[$checkboxText, { color: $colors.secondaryText }]}>{t("welcome.agree")}</Text>
        </Pressable>
        {protocols.map((protocol) => {
          return <Pressable key={protocol.name} onPress={() => {
            navigation.push("WebViewScreen", {
              title: t("welcome." + protocol.name),
              url: protocol.url
            })
          }}>
            <Text style={[$checkboxText, { color: $colors.secondaryText }]}>《{t("welcome." + protocol.name)}》</Text>
          </Pressable>
        })}
      </View>
      <ConfirmModal ref={confirmModalRef} />
    </Screen>
  )
}
const $titleText: TextStyle = {
  marginTop: s(65),
  fontSize: 36,
  textAlign: 'center',
  marginBottom: s(20),
}
const $bg: ImageStyle = {
  width: s(375),
  height: s(365),
}
const $buttonContainer: ViewStyle = {
  width: s(343),
  marginHorizontal: s(16),
  flex: 1,
  marginTop: s(20),
  alignItems: 'center',
  justifyContent: 'center',
}
const $checkboxContainer: ViewStyle = {
  marginTop: s(20),
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
}
const $checkboxText: TextStyle = {
  fontSize: 14,
  marginLeft: s(4)
}