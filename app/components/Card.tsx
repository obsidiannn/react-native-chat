import { ReactNode } from "react";
import { ColorValue, View, ViewStyle } from "react-native";
import { ColorsState } from "app/stores/system";
import { s } from "app/utils/size";
import { useRecoilValue } from "recoil";

export const Card = (props: {
  rounded?: boolean,
  backgroundColor?: ColorValue,
  children: ReactNode,
  style?: ViewStyle
}) => {
  const $colors = useRecoilValue(ColorsState);
  return <View style={[
    $container,
    {
      backgroundColor: props.backgroundColor ?? $colors.background,
    },
    props.rounded && {
      borderRadius: s(20)
    },
    props.style
  ]}>
    {props.children}
  </View>
}
const $container: ViewStyle = {
  width: "100%",
  marginBottom: s(10),
  padding: s(16),
}