import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { Image } from "expo-image"
import { ImageStyle, TextStyle, View, ViewStyle, useColorScheme } from "react-native"
import {
  Text,
} from "app/components"
import { isRTL } from "../i18n"
import { AppStackScreenProps } from "../navigators"
import { colors, spacing } from "../theme"
import theme from "../theme/colors";
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"

import { s } from 'app/utils/size';

interface WelcomeScreenProps extends AppStackScreenProps<"Welcome"> {}

export const WelcomeScreen: FC<WelcomeScreenProps> = observer(function WelcomeScreen(
) {

  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])

  const colorScheme = useColorScheme();

  const $colors = colorScheme !== "dark" ? theme.$dark : theme.$light
  return (
    <View style={[$container,{
      backgroundColor: $colors.backgroundColor,
    }]}>
      <Image style={$bg} source={require("assets/images/welcomeBg.webp")} cachePolicy="disk"/>
      <View style={$topContainer}>
        <Text>hello {colorScheme}</Text>
        
        {/* <Image style={$welcomeLogo} source={welcomeLogo} />
        <Text
          testID="welcome-heading"
          style={$welcomeHeading}
          tx="welcomeScreen.readyForLaunch"
          preset="heading"
        />
        <Text tx="welcomeScreen.exciting" preset="subheading" />
        <Image style={$welcomeFace} source={welcomeFace} /> */}
      </View>

      <View style={[$bottomContainer, $bottomContainerInsets]}>
        <Text tx="welcomeScreen.postscript" size="md" />
      </View>
    </View>
  )
})

const $bg: ImageStyle = {
  width: s(375),
  height: s(443),
}
const $container: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $topContainer: ViewStyle = {
  flexShrink: 1,
  flexGrow: 1,
  flexBasis: "57%",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
}

const $bottomContainer: ViewStyle = {
  flexShrink: 1,
  flexGrow: 0,
  flexBasis: "43%",
  backgroundColor: colors.palette.neutral100,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  paddingHorizontal: spacing.lg,
  justifyContent: "space-around",
}
const $welcomeLogo: ImageStyle = {
  height: 88,
  width: "100%",
  marginBottom: spacing.xxl,
}

const $welcomeFace: ImageStyle = {
  height: 169,
  width: 269,
  position: "absolute",
  bottom: -47,
  right: -80,
  transform: [{ scaleX: isRTL ? -1 : 1 }],
}

const $welcomeHeading: TextStyle = {
  marginBottom: spacing.md,
}
