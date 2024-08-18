import Navbar from "app/components/Navbar"
import { s } from "app/utils/size"
import { StatusBar, View } from "react-native"
import { $colors } from "app/Colors"
import { useSafeAreaInsets } from "react-native-safe-area-context"
export interface ScreenXProps {
  theme: "light" | "dark";
  title: string;
  children?: React.ReactNode;
}
export const ScreenX = (props: ScreenXProps) => {
  const insets = useSafeAreaInsets()
  return <View style={{
    flex: 1,
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    backgroundColor: props.theme == "dark" ? $colors.slate950 : $colors.gray100,
  }}>
    <StatusBar barStyle={props.theme == "dark" ? "light-content" : "dark-content"} />
    <Navbar theme={props.theme} title={props.title} />
    <View style={{
      marginTop: s(10),
      flex: 1,
      backgroundColor: props.theme == "dark" ? $colors.slate700 : $colors.white,
      borderTopStartRadius: s(24),
      borderTopRightRadius: s(24),
    }}>
      {props.children}
    </View>
  </View>
}