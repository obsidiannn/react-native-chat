import React, { useEffect, useRef, useState } from "react"
import { Image } from "expo-image"
import { ImageStyle, View, Text, Pressable, ViewStyle, TextStyle } from "react-native";
import { s } from 'app/utils/size';
import { useRecoilValue } from "recoil"
import { ColorsState, ThemeState } from "app/stores/system"
import { useTranslation } from 'react-i18next';
import { Screen } from "app/components";
import { Button } from "app/components/Button";
import { StackScreenProps } from "@react-navigation/stack";
import { Checkbox } from "./Checkbox";
import { App } from "types/app";
import { ConfirmModal, ConfirmModalType } from "app/components/ConfirmModal";

type Props = StackScreenProps<App.StackParamList, 'WelcomeScreen'>;
export const WelcomeScreen = ({ navigation }: Props) => {
  const $theme = useRecoilValue(ThemeState)
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
  }, [])
  return (
    <Screen statusBarStyle={$theme} safeAreaEdges={["top"]} preset="scroll" backgroundColor={$colors.background}>
      <Text style={[$titleText, {
        color: $colors.text
      }]}>{t('welcome.title')}</Text>
      <Image style={$bg} source={require("assets/images/welcomeBg.webp")} cachePolicy="disk" />
      <View style={[$buttonContainer, {
        marginTop: s(40)
      }]}>
        <Button theme={$theme} onPress={() => navigation.navigate("UnlockScreen")} fullWidth size="large" label={t("welcome.signIn")} type="primary" />
      </View>
      <View style={$buttonContainer}>
        <Button theme={$theme} onPress={() => {
          if (!protocolStatus) {
            confirmModalRef.current?.open({
              title: t('welcome.confirm_title'),
              content: t('welcome.confirm_content'),
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
            <Text style={[$checkboxText, { color: $colors.secondaryText }]}>{t("welcome." + protocol.name)}</Text>
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